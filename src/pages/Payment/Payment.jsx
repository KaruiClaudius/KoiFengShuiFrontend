import React, { useState } from 'react';
import { Modal, Button } from '@mui/material';
import api from '../../config/axios'; 
import './Payment.css'; 
import momo from '../../assets/icons/momo.png';
import visa from '../../assets/icons/visa.jpg';
import card from '../../assets/icons/card.jpg';
import success from '../../assets/icons/success.png';

const PaymentMethod = () => {
    const [open, setOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false); // State for success modal

    const handlePayment = async () => {
        const selectedMethod = document.querySelector('input[name="payment"]:checked');
        if (selectedMethod) {
            await postAd(); 
            setSuccessModalOpen(true); // Open success modal
            setOpen(false); // Close payment modal
        } else {
            alert('Vui lòng chọn phương thức thanh toán!');
        }
    };

    const postAd = async () => {
        try {
            const adData = {
                title: "Tiêu đề tin", 
                description: "Mô tả tin", 
            };
            const response = await api.post('/api/ad', adData); 
            console.log("Đăng tin thành công:", response.data);
        } catch (error) {
            console.error("Đăng tin thất bại:", error);
        }
    };

    const closeSuccessModal = () => {
        setSuccessModalOpen(false); // Logic to close success modal
    };

    return (
        <>
            <Button variant="contained" onClick={() => setOpen(true)}>
                Đăng tin
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <div className="payment-method">
                    <h2 className="title">Value: 15 000 đ</h2>
                    <h3 className="subtitle">Choose payment method</h3>
                    <div className="option">
                        <label className="label">
                            <input type="radio" name="payment" value="Ngân hàng" />
                            Thẻ ngân hàng
                        </label>
                        <img src={card} alt="Thẻ ngân hàng" className="icon" />
                    </div>
                    <div className="option">
                        <label className="label">
                            <input type="radio" name="payment" value="Quốc tế" />
                            Thẻ quốc tế
                        </label>
                        <img src={visa} alt="Thẻ quốc tế" className="icon" />
                    </div>
                    <div className="option">
                        <label className="label">
                            <input type="radio" name="payment" value="Momo" />
                            Ví Momo
                        </label>
                        <img src={momo} alt="Ví Momo" className="icon" /> 
                    </div>
                    <button onClick={handlePayment} className="button">Thanh Toán</button>
                </div>
            </Modal>

            {/* Success Modal */}
            <Modal
                open={successModalOpen}
                onClose={closeSuccessModal}
                aria-labelledby="success-modal-title"
                aria-describedby="success-modal-description"
            >
                <div className="modal" style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '300px' }}>
                    <img src={(success)} alt="Success" style={{ width: '50px', height: '50px' }} />
                    <h2>Thanh toán thành công</h2>
                    <button onClick={closeSuccessModal}>Đóng</button>
                </div>
            </Modal>
        </>
    );
};

export default PaymentMethod;