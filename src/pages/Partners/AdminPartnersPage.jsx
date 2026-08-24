import { useEffect, useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Skeleton,
  notify,
} from "../../ui";
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from "../../api/partners";
import { extractApiError } from "../../api/core";

const EMPTY_FORM = { name: "", address: "", linkUrl: "", note: "", isActive: true };

const toForm = (partner) => ({
  name: partner?.name ?? "",
  address: partner?.address ?? "",
  linkUrl: partner?.linkUrl ?? "",
  note: partner?.note ?? "",
  isActive: partner?.isActive ?? true,
});

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getPartners();
      setPartners(response.data ?? []);
    } catch (err) {
      setLoadError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const startEdit = (partner) => {
    setEditingId(partner.id);
    setForm(toForm(partner));
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Vui lòng nhập tên đối tác";
    if (!form.address.trim()) errors.address = "Vui lòng nhập địa chỉ";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      if (editingId == null) {
        await createPartner(form);
        notify.success("Đã thêm đối tác.");
      } else {
        await updatePartner(editingId, form);
        notify.success("Đã cập nhật đối tác.");
      }
      cancelEdit();
      await fetchPartners();
    } catch (err) {
      notify.error(extractApiError(err).message || "Lưu đối tác thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (partner) => {
    if (!window.confirm(`Xóa đối tác "${partner.name}"?`)) return;
    try {
      await deletePartner(partner.id);
      notify.success("Đã xóa đối tác.");
      if (editingId === partner.id) cancelEdit();
      await fetchPartners();
    } catch (err) {
      notify.error(extractApiError(err).message || "Xóa đối tác thất bại.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          Quản lý đối tác
        </h1>
        <p className="mt-1 text-muted">Thêm, sửa, xóa cửa hàng trong danh sách đối tác.</p>
      </header>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-xl font-bold text-ink">
          {editingId == null ? "Thêm đối tác" : "Sửa đối tác"}
        </h2>
        <form onSubmit={handleSubmit} noValidate className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Tên đối tác"
            value={form.name}
            onChange={updateField("name")}
            error={formErrors.name}
          />
          <Input
            label="Địa chỉ"
            value={form.address}
            onChange={updateField("address")}
            error={formErrors.address}
          />
          <Input
            label="Liên kết (linkUrl)"
            value={form.linkUrl}
            onChange={updateField("linkUrl")}
            placeholder="https://…"
          />
          <Input
            label="Ghi chú"
            value={form.note}
            onChange={updateField("note")}
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={updateField("isActive")}
              className="h-4 w-4 accent-[#a92c2c]"
            />
            Đang hoạt động (hiển thị công khai)
          </label>
          <div className="flex items-center justify-end gap-3 sm:col-span-2">
            {editingId != null && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Hủy
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu…" : editingId == null ? "Thêm đối tác" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <div className="mt-8 space-y-3" role="status" aria-label="Đang tải">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </Card>
          ))}
        </div>
      ) : loadError ? (
        <EmptyState
          className="mt-8"
          title="Không thể tải danh sách đối tác"
          description={loadError}
          action={<Button onClick={fetchPartners}>Thử lại</Button>}
        />
      ) : partners.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Chưa có đối tác nào"
          description="Thêm đối tác đầu tiên bằng biểu mẫu phía trên."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {partners.map((partner) => (
            <li key={partner.id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">
                    {partner.name}
                    {!partner.isActive && (
                      <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-medium text-muted">
                        Ẩn
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">{partner.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => startEdit(partner)}>
                    Sửa
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleDelete(partner)}>
                    Xóa
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
