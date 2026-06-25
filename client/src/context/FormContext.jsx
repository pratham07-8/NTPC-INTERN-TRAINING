import { useContext , createContext, useState} from "react";

const FormContext = createContext();

const INITIAL_FORM = {

    salutation:      'Ms.',
    traineeName:     '',
    relationship:    '',
    instituteName:   '',
    fromDate:        '',
    toDate:          '',
    areaOfTraining:  '',
    guideName:       '',
    guideSalutation: 'Ms.',
    guideDesignation:'',
    guideDepartment: '',
}

export function FormProvider({ children }) {
    const [form, setForm]       = useState(INITIAL_FORM)
    const [step, setStep]       = useState(1)
    const [submitted, setSubmitted] = useState(false)

    // Update a single field: updateField('traineeName', 'Rahul')
    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    // Reset everything after submit
    const resetForm = () => {
        setForm(INITIAL_FORM)
        setStep(1)
        setSubmitted(false)
    }

    // Submit to backend
    const submitForm = async () => {
        try {
            const res = await fetch('http://localhost:5000/Review', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(form),
            })
            const data = await res.json()

            if (data.success) {
                setSubmitted(true)
                return { success: true, requestId: data.requestId }
            } else {
                return { success: false, message: data.message }
            }
        } catch (err) {
            console.error('Submit error:', err)
            return { success: false, message: 'Network error. Try again.' }
        }
    }

    return (
        <FormContext.Provider value={{
            form,
            step,
            submitted,
            updateField,
            setStep,
            submitForm,
            resetForm,
        }}>
            {children}
        </FormContext.Provider>
    )
}

export function useForm() {
    return useContext(FormContext)
}