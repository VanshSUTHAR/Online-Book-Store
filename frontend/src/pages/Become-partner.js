import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";
import {
    User,
    Store,
    MapPin,
    FileText,
    CreditCard,
    Briefcase,
    FileCheck,
    ChevronLeft,
    ChevronRight,
    Upload,
    Check,
    AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const NAME_RE = /^[A-Za-z\s.'-]{3,50}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;
const CITY_STATE_RE = /^[A-Za-z\s]{2,50}$/;
const PINCODE_RE = /^\d{6}$/;
const AADHAAR_RE = /^\d{12}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ACCOUNT_NUMBER_RE = /^\d{9,18}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_RE = /^[\w.-]{2,49}@[a-zA-Z]{2,64}$/;
const GST_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;

function calculateAge(dobString) {
    const dob = new Date(dobString);
    if (Number.isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

function validateFile(file, { maxSizeMB, requireImage = true } = {}) {
    if (!file) return "";
    if (requireImage && file.type && !file.type.startsWith("image/")) {
        return "Only image files (PNG/JPG) are allowed.";
    }
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        return `File must be smaller than ${maxSizeMB}MB.`;
    }
    return "";
}

// Field-level validators. Each receives (value, formData) and returns an
// error string, or "" if valid. Fields not listed here have no validation.
const validators = {
    fullName: (v) => {
        if (!v.trim()) return "Full name is required.";
        if (!NAME_RE.test(v.trim())) return "Enter a valid name (letters only, 3-50 characters).";
        return "";
    },
    mobileNumber: (v) => {
        if (!v.trim()) return "Mobile number is required.";
        if (!MOBILE_RE.test(v.trim())) return "Enter a valid 10-digit mobile number.";
        return "";
    },
    dob: (v) => {
        if (!v) return "";
        const age = calculateAge(v);
        if (age === null) return "Enter a valid date.";
        if (age < 18) return "You must be at least 18 years old.";
        if (age > 120) return "Enter a valid date of birth.";
        return "";
    },
    storeName: (v) => {
        if (v && v.length > 100) return "Store name must be under 100 characters.";
        return "";
    },
    storeDescription: (v) => {
        if (v && v.length > 500) return "Description must be under 500 characters.";
        return "";
    },
    profilePicture: (v) => validateFile(v, { maxSizeMB: 2 }),
    storeBanner: (v) => validateFile(v, { maxSizeMB: 5 }),
    addressLine1: (v) => {
        if (!v.trim()) return "Address line 1 is required.";
        if (v.trim().length < 5) return "Enter a more complete address.";
        return "";
    },
    city: (v) => {
        if (!v.trim()) return "City is required.";
        if (!CITY_STATE_RE.test(v.trim())) return "Enter a valid city name.";
        return "";
    },
    state: (v) => {
        if (!v.trim()) return "State is required.";
        if (!CITY_STATE_RE.test(v.trim())) return "Enter a valid state name.";
        return "";
    },
    pincode: (v) => {
        if (!v.trim()) return "Pincode is required.";
        if (!PINCODE_RE.test(v.trim())) return "Enter a valid 6-digit pincode.";
        return "";
    },
    country: (v) => (!v.trim() ? "Country is required." : ""),
    aadhaarNumber: (v) => {
        if (!v.trim()) return "Aadhaar number is required.";
        if (!AADHAAR_RE.test(v.trim())) return "Enter a valid 12-digit Aadhaar number.";
        return "";
    },
    panNumber: (v) => {
        if (!v.trim()) return "PAN number is required.";
        if (!PAN_RE.test(v.trim().toUpperCase())) return "Enter a valid PAN (e.g. ABCDE1234F).";
        return "";
    },
    aadhaarFront: (v) => {
        if (!v) return "Aadhaar front image is required.";
        return validateFile(v, { maxSizeMB: 5 });
    },
    aadhaarBack: (v) => {
        if (!v) return "Aadhaar back image is required.";
        return validateFile(v, { maxSizeMB: 5 });
    },
    panCard: (v) => {
        if (!v) return "PAN card image is required.";
        return validateFile(v, { maxSizeMB: 5 });
    },
    accountHolderName: (v, fd) => {
        if (fd.payoutOption !== "bank") return "";
        if (!v.trim()) return "Account holder name is required.";
        if (!NAME_RE.test(v.trim())) return "Enter a valid name.";
        return "";
    },
    bankName: (v, fd) => {
        if (fd.payoutOption !== "bank") return "";
        if (!v.trim()) return "Bank name is required.";
        return "";
    },
    accountNumber: (v, fd) => {
        if (fd.payoutOption !== "bank") return "";
        if (!v.trim()) return "Account number is required.";
        if (!ACCOUNT_NUMBER_RE.test(v.trim())) return "Enter a valid account number (9-18 digits).";
        return "";
    },
    confirmAccountNumber: (v, fd) => {
        if (fd.payoutOption !== "bank") return "";
        if (!v.trim()) return "Please confirm the account number.";
        if (v !== fd.accountNumber) return "Account numbers do not match.";
        return "";
    },
    ifscCode: (v, fd) => {
        if (fd.payoutOption !== "bank") return "";
        if (!v.trim()) return "IFSC code is required.";
        if (!IFSC_RE.test(v.trim().toUpperCase())) return "Enter a valid IFSC code (e.g. HDFC0001234).";
        return "";
    },
    upiId: (v, fd) => {
        if (fd.payoutOption !== "upi") return "";
        if (!v.trim()) return "UPI ID is required.";
        if (!UPI_RE.test(v.trim())) return "Enter a valid UPI ID (e.g. name@bank).";
        return "";
    },
    gstNumber: (v) => {
        if (!v || !v.trim()) return "";
        if (!GST_RE.test(v.trim().toUpperCase())) return "Enter a valid 15-character GSTIN.";
        return "";
    },
    experience: (v) => {
        if (v === "" || v === null || v === undefined) return "";
        if (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 70) {
            return "Enter a valid number of years (0-70).";
        }
        return "";
    },
};

// Fields that belong to each step (used to validate a whole step at once
// and to decide which fields to mark "touched" when the user tries to
// advance without fixing errors).
const STEP_FIELDS = {
    1: ["fullName", "mobileNumber", "dob"],
    2: ["storeName", "storeDescription", "profilePicture", "storeBanner"],
    3: ["addressLine1", "city", "state", "pincode", "country"],
    4: ["aadhaarNumber", "panNumber", "aadhaarFront", "aadhaarBack", "panCard"],
    5: ["accountHolderName", "bankName", "accountNumber", "confirmAccountNumber", "ifscCode", "upiId"],
    6: ["gstNumber", "experience"],
    7: [],
};

const REQUIRED_STEP_FIELDS = {
    1: ["fullName", "mobileNumber"],
    2: [],
    3: ["addressLine1", "city", "state", "pincode", "country"],
    4: ["aadhaarNumber", "panNumber", "aadhaarFront", "aadhaarBack", "panCard"],
    5: [], // handled dynamically based on payoutOption below
    6: [],
    7: [],
};

export default function BecomePartner() {
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 7;

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        emailAddress: "",
        mobileNumber: "",
        dob: "",
        storeName: "",
        storeDescription: "",
        profilePicture: null,
        storeBanner: null,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        aadhaarNumber: "",
        panNumber: "",
        aadhaarFront: null,
        aadhaarBack: null,
        panCard: null,
        payoutOption: "bank",
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        upiId: "",
        sellerType: "Individual",
        gstNumber: "",
        experience: "",
        confirmAccurate: false,
        agreeTerms: false,
        understandReview: false
    });

    // Per-field error messages
    const [errors, setErrors] = useState({});
    // Which fields the user has interacted with (controls when errors show)
    const [touched, setTouched] = useState({});

    // Pre-fill email if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: prev.fullName || user.name || "",
                emailAddress: user.email || ""
            }));
        }
    }, [user]);

    const runValidator = (name, value, fd) => {
        const validator = validators[name];
        if (!validator) return "";
        return validator(value, fd) || "";
    };

    // Handle Text Inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const nextValue = type === "checkbox" ? checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: nextValue };

            setErrors(prevErrors => {
                const nextErrors = { ...prevErrors, [name]: runValidator(name, nextValue, updated) };
                // Keep dependent fields in sync (e.g. confirm account number vs account number)
                if (name === "accountNumber") {
                    nextErrors.confirmAccountNumber = runValidator("confirmAccountNumber", updated.confirmAccountNumber, updated);
                }
                return nextErrors;
            });

            return updated;
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // Handle File Uploads
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files && files[0] ? files[0] : null;
        if (!file) return;

        setFormData(prev => {
            const updated = { ...prev, [name]: file };
            setErrors(prevErrors => ({ ...prevErrors, [name]: runValidator(name, file, updated) }));
            return updated;
        });
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // Validate every relevant field for a given step; returns an errors map
    const getStepErrors = (stepNum, fd = formData) => {
        const fields = STEP_FIELDS[stepNum] || [];
        const stepErrors = {};
        fields.forEach(name => {
            const err = runValidator(name, fd[name], fd);
            if (err) stepErrors[name] = err;
        });
        return stepErrors;
    };

    // Step Validation - now backed by the same validators used for inline errors
    const checkStepValidity = (stepNum, fd = formData) => {
        const stepErrors = getStepErrors(stepNum, fd);
        if (Object.keys(stepErrors).length > 0) return false;

        switch (stepNum) {
            case 1:
                return REQUIRED_STEP_FIELDS[1].every(f => fd[f] && fd[f].trim() !== "");
            case 2:
                return true; // Optional step
            case 3:
                return REQUIRED_STEP_FIELDS[3].every(f => fd[f] && fd[f].trim() !== "");
            case 4:
                return REQUIRED_STEP_FIELDS[4].every(f => fd[f] !== null && fd[f] !== "");
            case 5:
                if (fd.payoutOption === "bank") {
                    return (
                        fd.accountHolderName.trim() !== "" &&
                        fd.bankName.trim() !== "" &&
                        fd.accountNumber.trim() !== "" &&
                        fd.accountNumber === fd.confirmAccountNumber &&
                        fd.ifscCode.trim() !== ""
                    );
                }
                return fd.upiId.trim() !== "";
            case 6:
                return true;
            case 7:
                return fd.confirmAccurate && fd.agreeTerms && fd.understandReview;
            default:
                return false;
        }
    };

    const isStepValid = () => checkStepValidity(currentStep);

    const isStepAccessible = (stepNum) => {
        if (stepNum <= currentStep) return true;
        for (let i = 1; i < stepNum; i++) {
            if (!checkStepValidity(i)) return false;
        }
        return true;
    };

    // Mark every field in a step as touched, so errors become visible
    const touchStep = (stepNum) => {
        const fields = STEP_FIELDS[stepNum] || [];
        setTouched(prev => {
            const next = { ...prev };
            fields.forEach(f => { next[f] = true; });
            return next;
        });
        setErrors(prev => ({ ...prev, ...getStepErrors(stepNum) }));
    };

    const handleNext = () => {
        if (!isStepValid()) {
            touchStep(currentStep);
            return;
        }
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const convertFileToBase64 = (file) => {
        if (!file || typeof file === "string") return Promise.resolve(file);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all steps before submitting, not just the current one
        const allErrors = {};
        for (let step = 1; step <= totalSteps; step++) {
            Object.assign(allErrors, getStepErrors(step));
        }
        const allValid = Array.from({ length: totalSteps }, (_, i) => checkStepValidity(i + 1)).every(Boolean);

        if (!allValid) {
            setErrors(prev => ({ ...prev, ...allErrors }));
            const allFields = Object.values(STEP_FIELDS).flat();
            setTouched(prev => {
                const next = { ...prev };
                allFields.forEach(f => { next[f] = true; });
                return next;
            });
            // Jump to the first invalid step so the user can see what's wrong
            for (let step = 1; step <= totalSteps; step++) {
                if (!checkStepValidity(step)) {
                    setCurrentStep(step);
                    break;
                }
            }
            return;
        }

        try {
            // Convert files to base64
            const profilePictureBase64 = formData.profilePicture ? await convertFileToBase64(formData.profilePicture) : null;
            const storeBannerBase64 = formData.storeBanner ? await convertFileToBase64(formData.storeBanner) : null;
            const aadhaarFrontBase64 = formData.aadhaarFront ? await convertFileToBase64(formData.aadhaarFront) : null;
            const aadhaarBackBase64 = formData.aadhaarBack ? await convertFileToBase64(formData.aadhaarBack) : null;
            const panCardBase64 = formData.panCard ? await convertFileToBase64(formData.panCard) : null;

            const payload = {
                ...formData,
                profilePicture: profilePictureBase64,
                storeBanner: storeBannerBase64,
                aadhaarFront: aadhaarFrontBase64,
                aadhaarBack: aadhaarBackBase64,
                panCard: panCardBase64,
                userId: user ? user._id || user.id : null
            };

            const token = localStorage.getItem("token");
            const headers = {};
            if (token) {
                headers["Authorization"] = token;
            }

            const res = await api.post("/partner/apply", payload, { headers });
            if (res.data.success) {
                alert("Application submitted successfully! Our team will review your application soon.");
            } else {
                alert(res.data.message || "Failed to submit application.");
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "An error occurred during submission. Please try again.");
        }
    };

    const steps = [
        { number: 1, label: "Info", icon: User },
        { number: 2, label: "Store", icon: Store },
        { number: 3, label: "Address", icon: MapPin },
        { number: 4, label: "Identity", icon: FileText },
        { number: 5, label: "Payout", icon: CreditCard },
        { number: 6, label: "Business", icon: Briefcase },
        { number: 7, label: "Confirm", icon: FileCheck }
    ];

    // Small helper to render an error message under a field
    const FieldError = ({ name }) => {
        if (!touched[name] || !errors[name]) return null;
        return (
            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors[name]}
            </span>
        );
    };

    const inputClass = (name) =>
        `w-full rounded-xl border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${touched[name] && errors[name]
            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
        }`;

    return (
        <div className="min-h-screen bg-slate-50/50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Premium Informational Column */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Header Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800">
                        <h1 className="text-2xl font-extrabold tracking-tight font-playfair">
                            Book Partner Program
                        </h1>
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                            Sell your books directly to readers. Register in minutes and manage your inventory on a professional seller platform.
                        </p>
                    </div>

                    {/* Workflow Steps */}
                    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 space-y-5">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">How Partnership Works</h3>

                        <div className="space-y-4">
                            <div className="flex gap-3.5 items-start">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 border border-blue-100">1</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Complete Registration</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Fill out verification steps and gain instant access to your seller dashboard to upload books.</p>
                                </div>
                            </div>

                            <div className="flex gap-3.5 items-start">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 border border-blue-100">2</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Visible in Bookstore</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Your uploaded products are displayed directly in the online book store for customers to buy.</p>
                                </div>
                            </div>

                            <div className="flex gap-3.5 items-start">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 border border-blue-100">3</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Earn Payouts</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Receive automated monthly bank/UPI transfers of the exact price you list your books for.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quality Banner */}
                    <div className="bg-amber-50/60 border border-amber-200/50 rounded-3xl p-6 text-xs text-amber-900 shadow-sm flex gap-3.5 items-start">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-bold">Strict Quality Standard</p>
                            <p className="mt-1 text-[11px] text-amber-800/80 leading-relaxed">
                                Only good or well-kept books are accepted in the bookstore. <strong>Damaged books are strictly not allowed.</strong>
                            </p>
                        </div>
                    </div>

                </div>

                {/* Right Column: Dynamic Form Wizard */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">

                    {/* Timeline / Progress Stepper */}
                    <div className="bg-slate-900 px-6 py-8 text-white border-b border-slate-800">
                        <div className="flex items-center justify-between max-w-lg mx-auto">
                            {steps.map((step, idx) => {
                                const StepIcon = step.icon;
                                const isCompleted = currentStep > step.number;
                                const isActive = currentStep === step.number;
                                return (
                                    <React.Fragment key={step.number}>
                                        {idx > 0 && (
                                            <div
                                                className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${isCompleted ? "bg-blue-500" : "bg-slate-700"
                                                    }`}
                                            />
                                        )}
                                        <div className="flex flex-col items-center relative">
                                            <button
                                                type="button"
                                                disabled={!isStepAccessible(step.number)}
                                                onClick={() => setCurrentStep(step.number)}
                                                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted
                                                    ? "bg-blue-600 border-blue-600 text-white cursor-pointer hover:bg-blue-700 hover:border-blue-700"
                                                    : isActive
                                                        ? "bg-slate-800 border-blue-500 text-blue-500 cursor-default"
                                                        : isStepAccessible(step.number)
                                                            ? "bg-slate-950 border-slate-700 text-slate-300 cursor-pointer hover:border-blue-400 hover:text-blue-400"
                                                            : "bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed"
                                                    }`}
                                                title={step.label}
                                            >
                                                {isCompleted ? <Check className="h-4.5 w-4.5" /> : <StepIcon className="h-4.5 w-4.5" />}
                                            </button>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="text-center mt-4">
                            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                Step {currentStep} of {totalSteps} — {steps[currentStep - 1].label}
                            </span>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="px-6 py-10 sm:px-10 space-y-8" noValidate>

                        {/* Step 1: Personal Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter full name"
                                            className={inputClass("fullName")}
                                        />
                                        <FieldError name="fullName" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="emailAddress"
                                            disabled
                                            value={formData.emailAddress || "Guest (Please login to auto-fill)"}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number *</label>
                                        <input
                                            type="tel"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            className={inputClass("mobileNumber")}
                                        />
                                        <FieldError name="mobileNumber" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth (Optional)</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            max={new Date().toISOString().split("T")[0]}
                                            className={inputClass("dob")}
                                        />
                                        <FieldError name="dob" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Store Info */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Store Information
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Optional (Can be skipped)</span>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Name (Optional)</label>
                                        <input
                                            type="text"
                                            name="storeName"
                                            value={formData.storeName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Example: Vansh Book Store"
                                            maxLength={100}
                                            className={inputClass("storeName")}
                                        />
                                        <FieldError name="storeName" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Description (Optional)</label>
                                        <textarea
                                            name="storeDescription"
                                            rows={4}
                                            value={formData.storeDescription}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Example: We specialize in engineering, competitive exam, and second-hand books."
                                            maxLength={500}
                                            className={inputClass("storeDescription")}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <FieldError name="storeDescription" />
                                            <span className="text-[10px] text-slate-400 ml-auto">{formData.storeDescription.length}/500</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profile Picture (Optional)</label>
                                            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-colors bg-slate-50/30 ${touched.profilePicture && errors.profilePicture ? "border-red-300" : "border-slate-200 hover:border-blue-500"}`}>
                                                <div className="space-y-1 text-center">
                                                    <Upload className="mx-auto h-7 w-7 text-slate-400" />
                                                    <label className="cursor-pointer text-xs font-bold text-blue-600 block">
                                                        <span>Upload profile</span>
                                                        <input type="file" name="profilePicture" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                                    </label>
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        {formData.profilePicture ? formData.profilePicture.name : "PNG, JPG up to 2MB"}
                                                    </p>
                                                </div>
                                            </div>
                                            <FieldError name="profilePicture" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Banner (Optional)</label>
                                            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-colors bg-slate-50/30 ${touched.storeBanner && errors.storeBanner ? "border-red-300" : "border-slate-200 hover:border-blue-500"}`}>
                                                <div className="space-y-1 text-center">
                                                    <Upload className="mx-auto h-7 w-7 text-slate-400" />
                                                    <label className="cursor-pointer text-xs font-bold text-blue-600 block">
                                                        <span>Upload banner</span>
                                                        <input type="file" name="storeBanner" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                                    </label>
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        {formData.storeBanner ? formData.storeBanner.name : "PNG, JPG up to 5MB"}
                                                    </p>
                                                </div>
                                            </div>
                                            <FieldError name="storeBanner" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Address */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                                    Store Address
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address Line 1 *</label>
                                        <input
                                            type="text"
                                            name="addressLine1"
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="House/Shop no., Street, Area"
                                            className={inputClass("addressLine1")}
                                        />
                                        <FieldError name="addressLine1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                            placeholder="Landmark, Suite, Unit"
                                            className={inputClass("addressLine2")}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={inputClass("city")}
                                            />
                                            <FieldError name="city" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State *</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={inputClass("state")}
                                            />
                                            <FieldError name="state" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pincode *</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                maxLength={6}
                                                className={inputClass("pincode")}
                                            />
                                            <FieldError name="pincode" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country *</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={inputClass("country")}
                                            />
                                            <FieldError name="country" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Identity Verification */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                                    Identity Verification
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhaar Number *</label>
                                        <input
                                            type="text"
                                            name="aadhaarNumber"
                                            value={formData.aadhaarNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="12-digit Aadhaar"
                                            maxLength={12}
                                            className={inputClass("aadhaarNumber")}
                                        />
                                        <FieldError name="aadhaarNumber" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Number *</label>
                                        <input
                                            type="text"
                                            name="panNumber"
                                            value={formData.panNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="e.g. ABCDE1234F"
                                            maxLength={10}
                                            style={{ textTransform: "uppercase" }}
                                            className={inputClass("panNumber")}
                                        />
                                        <FieldError name="panNumber" />
                                    </div>
                                </div>

                                {/* Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhaar Front *</label>
                                        <div className={`mt-1 flex justify-center px-4 py-6 border-2 border-dashed rounded-2xl transition-colors bg-slate-50/30 ${touched.aadhaarFront && errors.aadhaarFront ? "border-red-300" : "border-slate-200 hover:border-blue-500"}`}>
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                                                <label className="cursor-pointer text-xs font-bold text-blue-600 block">
                                                    <span>Upload File</span>
                                                    <input type="file" name="aadhaarFront" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                                </label>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {formData.aadhaarFront ? formData.aadhaarFront.name : "Aadhaar Card Front"}
                                                </p>
                                            </div>
                                        </div>
                                        <FieldError name="aadhaarFront" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhaar Back *</label>
                                        <div className={`mt-1 flex justify-center px-4 py-6 border-2 border-dashed rounded-2xl transition-colors bg-slate-50/30 ${touched.aadhaarBack && errors.aadhaarBack ? "border-red-300" : "border-slate-200 hover:border-blue-500"}`}>
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                                                <label className="cursor-pointer text-xs font-bold text-blue-600 block">
                                                    <span>Upload File</span>
                                                    <input type="file" name="aadhaarBack" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                                </label>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {formData.aadhaarBack ? formData.aadhaarBack.name : "Aadhaar Card Back"}
                                                </p>
                                            </div>
                                        </div>
                                        <FieldError name="aadhaarBack" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Card File *</label>
                                        <div className={`mt-1 flex justify-center px-4 py-6 border-2 border-dashed rounded-2xl transition-colors bg-slate-50/30 ${touched.panCard && errors.panCard ? "border-red-300" : "border-slate-200 hover:border-blue-500"}`}>
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                                                <label className="cursor-pointer text-xs font-bold text-blue-600 block">
                                                    <span>Upload File</span>
                                                    <input type="file" name="panCard" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                                </label>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {formData.panCard ? formData.panCard.name : "PAN Card Image"}
                                                </p>
                                            </div>
                                        </div>
                                        <FieldError name="panCard" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Bank Details */}
                        {currentStep === 5 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                                    Payout Bank Details
                                </h3>

                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-1 bg-slate-100 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, payoutOption: "bank" }))}
                                        className={`py-2.5 text-xs font-bold rounded-xl transition-all ${formData.payoutOption === "bank"
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-950"
                                            }`}
                                    >
                                        Bank Account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, payoutOption: "upi" }))}
                                        className={`py-2.5 text-xs font-bold rounded-xl transition-all ${formData.payoutOption === "upi"
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-950"
                                            }`}
                                    >
                                        UPI ID
                                    </button>
                                </div>

                                {formData.payoutOption === "bank" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in duration-300">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Holder Name *</label>
                                            <input
                                                type="text"
                                                name="accountHolderName"
                                                value={formData.accountHolderName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Same as Identity card"
                                                className={inputClass("accountHolderName")}
                                            />
                                            <FieldError name="accountHolderName" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Name *</label>
                                            <input
                                                type="text"
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="e.g. HDFC Bank"
                                                className={inputClass("bankName")}
                                            />
                                            <FieldError name="bankName" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number *</label>
                                            <input
                                                type="password"
                                                name="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Enter account number"
                                                className={inputClass("accountNumber")}
                                            />
                                            <FieldError name="accountNumber" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Account Number *</label>
                                            <input
                                                type="text"
                                                name="confirmAccountNumber"
                                                value={formData.confirmAccountNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Re-enter account number"
                                                className={inputClass("confirmAccountNumber")}
                                            />
                                            <FieldError name="confirmAccountNumber" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IFSC Code *</label>
                                            <input
                                                type="text"
                                                name="ifscCode"
                                                value={formData.ifscCode}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="e.g. HDFC0001234"
                                                maxLength={11}
                                                style={{ textTransform: "uppercase" }}
                                                className={inputClass("ifscCode")}
                                            />
                                            <FieldError name="ifscCode" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-md mx-auto pt-4 animate-in fade-in duration-300">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UPI ID *</label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            value={formData.upiId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="e.g. mobile@upi"
                                            className={inputClass("upiId")}
                                        />
                                        <FieldError name="upiId" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 6: Business Details */}
                        {currentStep === 6 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                                    Business Information
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Entity Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2.5 cursor-pointer border border-slate-200 px-5 py-3.5 rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/50">
                                                <input
                                                    type="radio"
                                                    name="sellerType"
                                                    value="Individual"
                                                    checked={formData.sellerType === "Individual"}
                                                    onChange={handleChange}
                                                    className="text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                                                />
                                                <span className="text-sm font-semibold text-slate-700">Individual</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 cursor-pointer border border-slate-200 px-5 py-3.5 rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/50">
                                                <input
                                                    type="radio"
                                                    name="sellerType"
                                                    value="Business"
                                                    checked={formData.sellerType === "Business"}
                                                    onChange={handleChange}
                                                    className="text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                                                />
                                                <span className="text-sm font-semibold text-slate-700">Corporate / Business</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GST Number (Optional)</label>
                                            <input
                                                type="text"
                                                name="gstNumber"
                                                value={formData.gstNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="15-digit GSTIN"
                                                maxLength={15}
                                                style={{ textTransform: "uppercase" }}
                                                className={inputClass("gstNumber")}
                                            />
                                            <FieldError name="gstNumber" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Years of Selling Experience (Optional)</label>
                                            <input
                                                type="number"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="e.g. 3"
                                                min={0}
                                                max={70}
                                                className={inputClass("experience")}
                                            />
                                            <FieldError name="experience" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 7: Terms & Conditions */}
                        {currentStep === 7 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                                    Terms & Conditions
                                </h3>
                                <div className="space-y-4">
                                    <label className="flex items-start gap-3.5 cursor-pointer bg-slate-50/50 border border-slate-100 p-4.5 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="confirmAccurate"
                                            checked={formData.confirmAccurate}
                                            onChange={handleChange}
                                            className="mt-1 h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 leading-relaxed">
                                            I confirm that all the information provided is accurate and correct.
                                        </span>
                                    </label>
                                    <label className="flex items-start gap-3.5 cursor-pointer bg-slate-50/50 border border-slate-100 p-4.5 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="agreeTerms"
                                            checked={formData.agreeTerms}
                                            onChange={handleChange}
                                            className="mt-1 h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 leading-relaxed">
                                            I agree to the Seller Terms & Conditions and bookstore policies.
                                        </span>
                                    </label>
                                    <label className="flex items-start gap-3.5 cursor-pointer bg-slate-50/50 border border-slate-100 p-4.5 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="understandReview"
                                            checked={formData.understandReview}
                                            onChange={handleChange}
                                            className="mt-1 h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 leading-relaxed">
                                            I understand that my application will be reviewed by admin before approval.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Controls */}
                        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 transition-colors ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 bg-white"
                                    }`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10 bg-blue-600 hover:bg-blue-700"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!isStepValid()}
                                    className={`flex items-center gap-1.5 px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10 ${isStepValid()
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-slate-300 cursor-not-allowed shadow-none"
                                        }`}
                                >
                                    Submit Application
                                </button>
                            )}
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}