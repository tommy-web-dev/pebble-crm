export interface WelcomeEmailData {
    email: string;
    displayName: string;
    dashboardUrl: string;
}

export const sendWelcomeEmail = async (data: WelcomeEmailData) => {
    try {
        console.log('Email service: Starting to send welcome email...');
        console.log('Email service: Calling server API endpoint...');
        
        const response = await fetch(`${window.location.origin}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailType: 'welcome',
                emailData: data
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send welcome email');
        }

        const result = await response.json();
        console.log('Welcome email sent successfully:', result);
        return result;

    } catch (error) {
        console.error('Email service error:', error);
        throw error;
    }
};

export const sendPaymentSuccessEmail = async (data: WelcomeEmailData) => {
    try {
        console.log('Email service: Starting to send payment success email...');
        console.log('Email service: Calling server API endpoint...');
        
        const response = await fetch(`${window.location.origin}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailType: 'payment-success',
                emailData: data
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send payment success email');
        }

        const result = await response.json();
        console.log('Payment success email sent successfully:', result);
        return result;

    } catch (error) {
        console.error('Email service error:', error);
        throw error;
    }
};
