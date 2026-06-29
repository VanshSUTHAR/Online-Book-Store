import React, { useState } from "react";
import {
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import { api } from "../services/api";

const StripeCheckout = ({
    amount,
    orderData,
    onSuccess,
}) => {

    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {

        if (!stripe || !elements) return;

        setLoading(true);

        try {

            const { data } = await api.post(
                "/payment/create-payment-intent",
                {
                    amount,
                }
            );

            const result = await stripe.confirmCardPayment(
                data.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    },
                }
            );

            if (result.error) {
                alert(result.error.message);
                setLoading(false);
                return;
            }

            if (
                result.paymentIntent.status === "succeeded"
            ) {

                await api.post(
                    "/orders",
                    orderData
                );

                alert("Payment Successful");

                onSuccess();
            }

        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    return (
        <>

            <CardElement />

            <button
                onClick={handlePayment}
                disabled={!stripe || loading}
            >
                {loading ? "Processing..." : "Pay"}
            </button>

        </>
    );
};

export default StripeCheckout;