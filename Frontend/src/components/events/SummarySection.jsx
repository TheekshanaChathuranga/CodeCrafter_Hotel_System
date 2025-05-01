import React from 'react';

const SummarySection = ({ totalAmount, serviceCharge, extraAmount, grandTotal }) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-right">Total Amount:</div>
        <div className="text-right">Rs. {totalAmount.toFixed(2)}</div>
        <div className="text-right">Service Charge (10%):</div>
        <div className="text-right">Rs. {serviceCharge.toFixed(2)}</div>
        <div className="text-right">Extra Amount:</div>
        <div className="text-right">Rs. {extraAmount.toFixed(2)}</div>
        <div className="text-right font-bold">Grand Total:</div>
        <div className="text-right font-bold">Rs. {grandTotal.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default SummarySection; 