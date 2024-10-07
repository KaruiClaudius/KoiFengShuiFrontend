import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@mui/material';
import api from '../../config/axios'; 
import './Payment.css'; 
import momo from '../../assets/icons/momo.png';
import visa from '../../assets/icons/visa.jpg';
import card from '../../assets/icons/card.jpg';
import success from '../../assets/icons/success.png';

const PaymentMethod = ({ accountId }) => { // Nhận accountId từ props
    const [open, setOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [amount, setAmount] = useState(0); // State để lưu giá trị tiền

    useEffect(() => {
        const fetchAmount = async () => {
            try {
                const response = await api.get('/api/amount'); // Gọi API để lấy giá trị tiền
                setAmount(response.data.amount); // Giả sử API trả về { amount: 15000 }
            } catch (error) {
                console.error("Lỗi khi lấy giá trị tiền:", error);
            }
        };

        fetchAmount();
    }, []); // Chỉ gọi một lần khi component được mount

    const handlePayment = async () => {
        const selectedMethod = document.querySelector('input[name="payment"]:checked');
        if (selectedMethod) {
            const transactionData = {
                accountId: accountId, // Sử dụng accountId từ props
                tierId: 1, // Thay đổi theo nhu cầu
                subscriptionId: 1, // Thay đổi theo nhu cầu
                amount: amount, // Sử dụng giá trị tiền đã nhận
                transactionDate: new Date().toISOString() // Ngày giao dịch
            };

            await postTransaction(transactionData); // Gọi hàm để tạo giao dịch
            setSuccessModalOpen(true); // Mở modal thành công
            setOpen(false); // Đóng modal thanh toán
        } else {
            alert('Vui lòng chọn phương thức thanh toán!');
        }
    };

    const postTransaction = async (transactionData) => {
        try {
            const response = await api.post('/api/transaction/process', transactionData); // Gọi API để tạo giao dịch
            console.log("Giao dịch thành công:", response.data);
        } catch (error) {
            console.error("Giao dịch thất bại:", error);
        }
    };

    const closeSuccessModal = () => {
        setSuccessModalOpen(false);
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
                    <h2 className="title">Value: {amount} đ</h2> {/* Hiển thị giá trị tiền */}
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
                    <img src={success} alt="Success" style={{ width: '50px', height: '50px' }} />
                    <h2>Thanh toán thành công</h2>
                    <button onClick={closeSuccessModal}>Đóng</button>
                </div>
            </Modal>
        </>
    );
};

export default PaymentMethod;