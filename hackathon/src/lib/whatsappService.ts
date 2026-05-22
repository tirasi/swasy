interface EBill {
  id: string;
  patientName: string;
  patientPhone: string;
  pharmacyName: string;
  items: Array<{
    medicineName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  generatedAt: string;
}

class WhatsAppService {
  private formatEBillMessage(eBill: EBill): string {
    const date = new Date(eBill.generatedAt).toLocaleDateString('en-IN');
    const time = new Date(eBill.generatedAt).toLocaleTimeString('en-IN');
    
    let message = `🏥 *MEDICAL E-BILL*\n\n`;
    message += `📋 *Bill ID:* ${eBill.id}\n`;
    message += `👤 *Patient:* ${eBill.patientName}\n`;
    message += `🏪 *Pharmacy:* ${eBill.pharmacyName}\n`;
    message += `📅 *Date:* ${date} ${time}\n\n`;
    
    message += `💊 *MEDICINES:*\n`;
    message += `${'─'.repeat(30)}\n`;
    
    eBill.items.forEach((item, index) => {
      message += `${index + 1}. ${item.medicineName}\n`;
      message += `   Qty: ${item.quantity} × ₹${item.price} = ₹${item.total}\n\n`;
    });
    
    message += `${'─'.repeat(30)}\n`;
    message += `💰 *Subtotal:* ₹${eBill.subtotal.toFixed(2)}\n`;
    message += `📊 *Tax (18% GST):* ₹${eBill.tax.toFixed(2)}\n`;
    message += `💳 *TOTAL AMOUNT:* ₹${eBill.total.toFixed(2)}\n\n`;
    
    message += `✅ *Payment Status:* PAID\n`;
    message += `🔒 *This is a computer generated bill*\n\n`;
    message += `Thank you for choosing our pharmacy! 🙏\n`;
    message += `For queries: Call pharmacy directly`;
    
    return message;
  }

  shareEBillOnWhatsApp(eBill: EBill, phoneNumber: string = '9853224433'): void {
    const message = this.formatEBillMessage(eBill);
    const encodedMessage = encodeURIComponent(message);
    
    // Format phone number for WhatsApp (remove any non-digits and add country code)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new window/tab
    window.open(whatsappUrl, '_blank');
  }

  downloadEBillAsPDF(eBill: EBill): void {
    const content = this.formatEBillMessage(eBill);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `eBill_${eBill.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  printEBill(eBill: EBill): void {
    const content = this.formatEBillMessage(eBill);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>E-Bill ${eBill.id}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
}

export const whatsappService = new WhatsAppService();