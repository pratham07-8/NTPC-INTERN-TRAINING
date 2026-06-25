import prisma from "../Models/db.js";

export const submit = async(req,res) => {

    try{

        const {salutation,
                traineeName,
                relationship,
                instituteName,
                fromDate,
                toDate,
                areaOfTraining,
                guideName,
                guideSalutation,
                guideDesignation,
                guideDepartment} = req.body;

        const traineeDetail = await prisma.trainee.create({

            data : {
                salutation : salutation,
                full_name : traineeName,
                relationship : relationship,
                institute : instituteName,
                from_date : new Date(fromDate),
                to_date : new Date(toDate),
                area_of_training : areaOfTraining
            }
        })

        const guideDetail = await prisma.guide.create({

            data:{
                salutation : guideSalutation,
                full_name : guideName,
                designation : guideDesignation,
                department : guideDepartment
            }
        })

        const requestDetail = await prisma.training_request.create({

            data:{
                trainee_id : traineeDetail.id,
                guide_id : guideDetail.id
            }
        })

        return res.status(201).json({
            success : true,
            message : 'Training request submitted successfully',
            requestId : requestDetail.id
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error: err.message});
    }
}