import React, { useEffect } from 'react';

interface StripePricingTableProps {
    pricingTableId: string;
    publishableKey: string;
}

const StripePricingTable: React.FC<StripePricingTableProps> = ({ pricingTableId, publishableKey }) => {
    useEffect(() => {
        // Load Stripe pricing table script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            // Create the pricing table element
            const pricingTable = document.createElement('stripe-pricing-table');
            pricingTable.setAttribute('pricing-table-id', pricingTableId);
            pricingTable.setAttribute('publishable-key', publishableKey);

            // Find the container and append the pricing table
            const container = document.getElementById('stripe-pricing-container');
            if (container) {
                container.innerHTML = '';
                container.appendChild(pricingTable);
            }
        };

        return () => {
            // Cleanup
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [pricingTableId, publishableKey]);

    return (
        <div id="stripe-pricing-container" className="w-full">
            {/* Stripe pricing table will be inserted here */}
        </div>
    );
};

export default StripePricingTable; 