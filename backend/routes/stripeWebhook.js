import Enrollment from '../models/Enrollment.js';
import { stripe } from '../config/stripe.js';

/**
 * Stripe calls this endpoint after a checkout session finishes.
 * It must receive the raw request body (see server.js) so the signature can be verified –
 * without that check anyone could mark an enrollment as paid.
 */
export const stripeWebhook = async (req, res) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !secret) {
        return res.status(503).json({ message: 'Stripe webhook is not configured.' });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);
    } catch (err) {
        console.warn('Stripe webhook signature check failed:', err.message);
        return res.status(400).json({ message: 'Invalid signature.' });
    }

    const session = event.data.object;

    switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
            if (session.payment_status === 'paid') {
                await Enrollment.updateOne(
                    { stripeSessionId: session.id },
                    { paymentStatus: 'Paid', status: 'Active' }
                );
            }
            break;
        case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired':
            await Enrollment.updateOne(
                { stripeSessionId: session.id, paymentStatus: 'Pending' },
                { paymentStatus: 'Failed' }
            );
            break;
        default:
            break;
    }

    res.json({ received: true });
};
