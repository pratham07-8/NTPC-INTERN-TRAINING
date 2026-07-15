import prisma from "../Models/db.js";

// Submit a new request
export const submit = async (req, res) => {
  try {
    const {
      salutation,
      traineeName,
      relationship,
      instituteName,
      fromDate,
      toDate,
      areaOfTraining,
      guideName,
      guideSalutation,
      guideDesignation,
      guideDepartment
    } = req.body;

    const proposer_id = req.user ? req.user.id : null;

    const traineeDetail = await prisma.trainee.create({
      data: {
        salutation: salutation,
        full_name: traineeName,
        relationship: relationship,
        institute: instituteName,
        from_date: new Date(fromDate),
        to_date: new Date(toDate),
        area_of_training: areaOfTraining
      }
    });

    const guideDetail = await prisma.guide.create({
      data: {
        salutation: guideSalutation,
        full_name: guideName,
        designation: guideDesignation,
        department: guideDepartment
      }
    });

    const requestDetail = await prisma.training_request.create({
      data: {
        trainee_id: traineeDetail.id,
        guide_id: guideDetail.id,
        proposer_id: proposer_id,
        status: "PENDING_GUIDE",
        remarks: ""
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Training request submitted successfully',
      requestId: requestDetail.id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get requests based on user role
export const getRequests = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let requests = [];

    if (role === "PROPOSER") {
      requests = await prisma.training_request.findMany({
        where: { proposer_id: userId },
        include: { trainee: true, guide: true, proposer: { select: { name: true, email: true } } },
        orderBy: { submitted_at: 'desc' }
      });
    } else {
      // Map role to the status it reviews
      if (role === "GUIDE_GM") {
        requests = await prisma.training_request.findMany({
          where: {
            status: "PENDING_GGM",
            guide: {
              department: req.user.department || ""
            }
          },
          include: { trainee: true, guide: true, proposer: { select: { name: true, email: true } } },
          orderBy: { submitted_at: 'desc' }
        });
      } else {
        let targetStatus = "";
        if (role === "GUIDE") targetStatus = "PENDING_GUIDE";
        else if (role === "TRAINING_OFFICER") targetStatus = "PENDING_TO";
        else if (role === "HR_GM") targetStatus = "PENDING_HR";

        requests = await prisma.training_request.findMany({
          where: { status: targetStatus },
          include: { trainee: true, guide: true, proposer: { select: { name: true, email: true } } },
          orderBy: { submitted_at: 'desc' }
        });
      }
    }

    return res.status(200).json({
      success: true,
      requests
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Take action on a request (Approve / Reject)
export const takeAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;
    const { role } = req.user;

    const trainingRequest = await prisma.training_request.findUnique({
      where: { id: parseInt(id) },
      include: { guide: true }
    });

    if (!trainingRequest) {
      return res.status(404).json({ success: false, message: "Training request not found" });
    }

    if (role === "GUIDE_GM" && trainingRequest.guide.department !== req.user.department) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only approve/reject requests within your department" });
    }

    // Determine next status
    let nextStatus = trainingRequest.status;

    if (action === "REJECT") {
      if (role === "GUIDE" && trainingRequest.status === "PENDING_GUIDE") {
        nextStatus = "REJECTED"; // Back to Proposer
      } else if (role === "GUIDE_GM" && trainingRequest.status === "PENDING_GGM") {
        nextStatus = "PENDING_GUIDE"; // Back to Guide
      } else if (role === "TRAINING_OFFICER" && trainingRequest.status === "PENDING_TO") {
        nextStatus = "PENDING_GGM"; // Back to Dept GM
      } else if (role === "HR_GM" && trainingRequest.status === "PENDING_HR") {
        nextStatus = "PENDING_TO"; // Back to Training Officer
      } else {
        return res.status(400).json({ success: false, message: "Invalid action for current request state and user role" });
      }
    } else if (action === "APPROVE") {
      if (role === "GUIDE" && trainingRequest.status === "PENDING_GUIDE") {
        nextStatus = "PENDING_GGM";
      } else if (role === "GUIDE_GM" && trainingRequest.status === "PENDING_GGM") {
        nextStatus = "PENDING_TO";
      } else if (role === "TRAINING_OFFICER" && trainingRequest.status === "PENDING_TO") {
        nextStatus = "PENDING_HR";
      } else if (role === "HR_GM" && trainingRequest.status === "PENDING_HR") {
        nextStatus = "APPROVED";
      } else {
        return res.status(400).json({ success: false, message: "Invalid action for current request state and user role" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid action type" });
    }

    const updatedRequest = await prisma.training_request.update({
      where: { id: parseInt(id) },
      data: {
        status: nextStatus,
        remarks: remarks || trainingRequest.remarks
      },
      include: { trainee: true, guide: true }
    });

    return res.status(200).json({
      success: true,
      message: `Request successfully ${action.toLowerCase()}d`,
      request: updatedRequest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};