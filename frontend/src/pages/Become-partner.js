import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
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
    HelpCircle,
    TrendingUp,
    Layers,
    Home
} from "lucide-react";

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

    // Handle Text Inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Handle File Uploads
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    // Step Validation
    const checkStepValidity = (stepNum) => {
        switch (stepNum) {
            case 1:
                return formData.fullName.trim() !== "" && formData.mobileNumber.trim() !== "";
            case 2:
                return true; // Optional step
            case 3:
                return (
                    formData.addressLine1.trim() !== "" &&
                    formData.city.trim() !== "" &&
                    formData.state.trim() !== "" &&
                    formData.pincode.trim() !== "" &&
                    formData.country.trim() !== ""
                );
            case 4:
                return (
                    formData.aadhaarNumber.trim().length >= 12 &&
                    formData.panNumber.trim().length >= 10 &&
                    formData.aadhaarFront !== null &&
                    formData.aadhaarBack !== null &&
                    formData.panCard !== null
                );
            case 5:
                if (formData.payoutOption === "bank") {
                    return (
                        formData.accountHolderName.trim() !== "" &&
                        formData.bankName.trim() !== "" &&
                        formData.accountNumber.trim() !== "" &&
                        formData.accountNumber === formData.confirmAccountNumber &&
                        formData.ifscCode.trim() !== ""
                    );
                } else {
                    return formData.upiId.trim().includes("@");
                }
            case 6:
                return true;
            case 7:
                return formData.confirmAccurate && formData.agreeTerms && formData.understandReview;
            default:
                return false;
        }
    };

    const isStepValid = () => {
        return checkStepValidity(currentStep);
    };

    const isStepAccessible = (stepNum) => {
        if (stepNum <= currentStep) return true;
        for (let i = 1; i < stepNum; i++) {
            if (!checkStepValidity(i)) {
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (isStepValid() && currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isStepValid()) {
            alert("Application submitted successfully! Our team will review your application soon.");
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
                    <form onSubmit={handleSubmit} className="px-6 py-10 sm:px-10 space-y-8">

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
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter full name"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
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
                                            required
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                            placeholder="Enter mobile number"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth (Optional)</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
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
                                            placeholder="Example: Vansh Book Store"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Description (Optional)</label>
                                        <textarea
                                            name="storeDescription"
                                            rows={4}
                                            value={formData.storeDescription}
                                            onChange={handleChange}
                                            placeholder="Example: We specialize in engineering, competitive exam, and second-hand books."
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profile Picture (Optional)</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/30">
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
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Banner (Optional)</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/30">
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
                                            required
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                            placeholder="House/Shop no., Street, Area"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                            placeholder="Landmark, Suite, Unit"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State *</label>
                                            <input
                                                type="text"
                                                name="state"
                                                required
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pincode *</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                required
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country *</label>
                                            <input
                                                type="text"
                                                name="country"
                                                required
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
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
                                            required
                                            value={formData.aadhaarNumber}
                                            onChange={handleChange}
                                            placeholder="12-digit Aadhaar"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Number *</label>
                                        <input
                                            type="text"
                                            name="panNumber"
                                            required
                                            value={formData.panNumber}
                                            onChange={handleChange}
                                            placeholder="10-digit PAN"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhaar Front *</label>
                                        <div className="mt-1 flex justify-center px-4 py-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/30">
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
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhaar Back *</label>
                                        <div className="mt-1 flex justify-center px-4 py-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/30">
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
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Card File *</label>
                                        <div className="mt-1 flex justify-center px-4 py-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/30">
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
                                                required
                                                value={formData.accountHolderName}
                                                onChange={handleChange}
                                                placeholder="Same as Identity card"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Name *</label>
                                            <input
                                                type="text"
                                                name="bankName"
                                                required
                                                value={formData.bankName}
                                                onChange={handleChange}
                                                placeholder="e.g. HDFC Bank"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number *</label>
                                            <input
                                                type="password"
                                                name="accountNumber"
                                                required
                                                value={formData.accountNumber}
                                                onChange={handleChange}
                                                placeholder="Enter account number"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Account Number *</label>
                                            <input
                                                type="text"
                                                name="confirmAccountNumber"
                                                required
                                                value={formData.confirmAccountNumber}
                                                onChange={handleChange}
                                                placeholder="Re-enter account number"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                            {formData.accountNumber && formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                                                <span className="text-[10px] text-red-500 font-semibold block mt-1">Numbers do not match.</span>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IFSC Code *</label>
                                            <input
                                                type="text"
                                                name="ifscCode"
                                                required
                                                value={formData.ifscCode}
                                                onChange={handleChange}
                                                placeholder="11-digit IFSC Code"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-md mx-auto pt-4 animate-in fade-in duration-300">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UPI ID *</label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            required
                                            value={formData.upiId}
                                            onChange={handleChange}
                                            placeholder="e.g. mobile@upi"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
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
                                                placeholder="15-digit GSTIN"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Years of Selling Experience (Optional)</label>
                                            <input
                                                type="number"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                placeholder="e.g. 3"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
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
                                    disabled={!isStepValid()}
                                    className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10 ${isStepValid()
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "bg-slate-300 cursor-not-allowed shadow-none"
                                        }`}
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