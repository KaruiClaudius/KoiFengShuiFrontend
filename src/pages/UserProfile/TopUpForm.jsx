import { useState, useEffect, useCallback } from "react";
import { usePayOS } from "payos-checkout";
import api from "../../config/axios";
import { Button, Modal, Space, InputNumber, message } from "antd";

const TopUpForm = ({ visible, onSuccess, onClose, initialAmount = 0 }) => {
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState(initialAmount.toString());
  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: window.location.origin,
    ELEMENT_ID: "embedded-payment-container",
    CHECKOUT_URL: null,
    embedded: true,
    onSuccess: (event) => {
      onSuccess("Nạp tiền thành công");
    },
  });

  // pass money needed for use something
  useEffect(() => {
    setAmount(initialAmount.toString());
  }, [initialAmount]);

  const { open, exit } = usePayOS(payOSConfig);

  const resetForm = useCallback(() => {
    setAmount("");
    setIsCreatingLink(false);
    setPayOSConfig((prevConfig) => ({
      ...prevConfig,
      CHECKOUT_URL: null,
    }));
    exit();
  }, [exit]);

  useEffect(() => {
    if (visible && !isModalOpen) {
      setIsModalOpen(true);
    } else if (!visible && isModalOpen) {
      setIsModalOpen(false);
      resetForm();
      const container = document.getElementById("embedded-payment-container");
      if (container) {
        container.innerHTML = "";
      }
    }
  }, [visible, isModalOpen, resetForm]);

  const checkOrderStatus = async (orderCode) => {
    try {
      const response = await api.post(
        "/api/Transaction/CheckOrder",
        { orderCode: orderCode }, // Send as an object
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error === 0) {
        if (response.data.data.paymentInfo.status === "PAID") {
          // Update the user's wallet balance in your application state
          onSuccess(
            `Nạp tiền thành công. Số dư mới: ${response.data.data.userInfo.wallet}`
          );
          return true; // Indicate successful payment
        } else if (response.data.data.paymentInfo.status === "CANCELLED") {
          message.error("Giao dịch đã bị hủy");
          return true; // Stop checking as the order is cancelled
        }
      }
      return false; // Payment not completed yet
    } catch (error) {
      console.error("Error checking order status:", error);
      message.error("Lỗi khi kiểm tra trạng thái giao dịch");
      return false;
    }
  };

  const handleGetPaymentLink = async () => {
    setIsCreatingLink(true);
    exit();
    try {
      const response = await api.post("/api/Transaction/CreatePayOSLink", {
        productName: "wallet",
        description: "nap vi",
        returnUrl: window.location.origin,
        cancelUrl: window.location.origin,
        price: parseInt(amount),
        buyerName: "",
      });

      if (response.data.error === 0) {
        setPayOSConfig((oldConfig) => ({
          ...oldConfig,
          CHECKOUT_URL: response.data.data.paymentInfo.checkoutUrl,
        }));

        const orderCode = response.data.data.paymentInfo.orderCode;
        console.log(orderCode);

        // Start checking order status
        const checkInterval = setInterval(async () => {
          const isCompleted = await checkOrderStatus(orderCode);
          if (isCompleted) {
            clearInterval(checkInterval);
            resetForm();
            onClose();
          }
        }, 5000);

        // Set a timeout to stop checking after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 5 * 60 * 1000);
      } else {
        throw new Error(
          response.data.message || "Failed to create payment link"
        );
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      message.error("Lỗi khi tạo liên kết thanh toán");
    } finally {
      setIsCreatingLink(false);
    }
  };

  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL != null) {
      open();
    }
  }, [payOSConfig, open]);

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      title="Nạp tiền vào ví"
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <InputNumber
          style={{ width: "100%" }}
          value={amount}
          onChange={(value) => setAmount(value)}
          placeholder="Nhập số tiền"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          min={0}
        />
        <Space>
          {isCreatingLink ? (
            <Button type="primary" loading>
              Đang tạo liên kết thanh toán...
            </Button>
          ) : (
            <Button
              block
              type="primary"
              onClick={handleGetPaymentLink}
              disabled={!amount}
            >
              Xác nhận nạp tiền
            </Button>
          )}
          <Button onClick={handleCancel}>Hủy</Button>
        </Space>
      </Space>
      {payOSConfig.CHECKOUT_URL && (
        <div
          id="embedded-payment-container"
          style={{ height: "400px", marginTop: "20px" }}
        ></div>
      )}
    </Modal>
  );
};

export default TopUpForm;
