"use client";

import { useEffect, useState } from "react";
import {
  apiGetFlats,
  apiAddFlat,
  apiUpdateFlat,
  apiDeleteFlat,
  apiCreateResidentUser,
  ApiFlat,
} from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import ConfirmModal from "@/app/components/ConfirmModal";

const FLAT_TYPES = ["1BHK", "2BHK", "3BHK"] as const;

export default function AdminFlatsPage() {
  const [flats, setFlats] = useState<ApiFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"flat_no" | "owner_name" | "type">(
    "flat_no",
  );
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<ApiFlat | null>(null);
  const [form, setForm] = useState({
    flat_no: "",
    owner_name: "",
    email: "",
    phone: "",
    type: "2BHK" as "1BHK" | "2BHK" | "3BHK",
  });
  const [createUser, setCreateUser] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  //----
  const [deleteModal, setDeleteModal] = useState<{
  open: boolean;
  flat: ApiFlat | null;
}>({ open: false, flat: null });

const [deleting, setDeleting] = useState(false);

  const perPage = 8;

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGetFlats();
      setFlats(data);
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Failed to load flats",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = flats
    .filter(
      (f) =>
        f.flat_no.toLowerCase().includes(search.toLowerCase()) ||
        f.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        (f.email || "").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "flat_no") return a.flat_no.localeCompare(b.flat_no);
      if (sortBy === "owner_name")
        return a.owner_name.localeCompare(b.owner_name);
      return (a.type as string).localeCompare(b.type as string);
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, page * perPage + perPage);

  const openAdd = () => {
    setForm({
      flat_no: "",
      owner_name: "",
      email: "",
      phone: "",
      type: "2BHK",
    });
    setCreateUser(true);
    setUserPassword("");
    setEditing(null);
    setModal("add");
  };

  const openEdit = (flat: ApiFlat) => {
    setForm({
      flat_no: flat.flat_no,
      owner_name: flat.owner_name,
      email: flat.email || "",
      phone: flat.phone || "",
      type: flat.type,
    });
    setCreateUser(false);
    setUserPassword("");
    setEditing(flat);
    setModal("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation: if creating user, email and password are required
    if (modal === "add" && createUser) {
      if (!form.email) {
        showToast("Email is required to create an owner login.", "error");
        return;
      }
      if (!userPassword || userPassword.length < 8) {
        showToast(
          "Password is required and must be at least 8 characters.",
          "error",
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      if (modal === "add") {
        const res = await apiAddFlat({
          flat_no: form.flat_no,
          owner_name: form.owner_name,
          email: form.email || null,
          phone: form.phone || null,
          type: form.type,
        });
        const newFlat = res.data;

        if (createUser) {
          if (!form.email || !userPassword) {
            showToast(
              "Flat added. To create user, email and password are required.",
              "info",
            );
          } else {
            await apiCreateResidentUser({
              name: form.owner_name,
              email: form.email,
              phone: form.phone || "",
              password: userPassword,
              flatId: newFlat.id,
            });
            showToast("Flat + owner login created", "success");
          }
        } else {
          showToast("Flat added successfully", "success");
        }
      } else if (editing) {
        await apiUpdateFlat(editing.id, {
          flatNo: form.flat_no,
          ownerName: form.owner_name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          type: form.type,
        });
        showToast("Flat updated successfully", "success");
      }
      setModal(null);
      setEditing(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

 const handleDeleteClick = (flat: ApiFlat) => {
  setDeleteModal({ open: true, flat });
};

const confirmDelete = async () => {
  if (!deleteModal.flat) return;

  setDeleting(true);
  try {
    // const res = await apiDeleteFlat(deleteModal.flat.id);

    showToast("Flat deleted");

    load();
  } catch (err) {
    showToast(err instanceof Error ? err.message : "Delete failed", "error");
  } finally {
    setDeleting(false);
    setDeleteModal({ open: false, flat: null });
  }
};


  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Flats</h1>
        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90"
        >
          Add Flat
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by flat no, owner, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="flex-1 min-w-50 py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
        >
          <option value="flat_no">Sort by Flat No</option>
          <option value="owner_name">Sort by Owner</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : (
        <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-glass">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">
                    Flat No
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">
                    Owner
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((flat) => (
                  <tr
                    key={flat.id}
                    className="border-b border-border-default hover:bg-bg-glass/50"
                  >
                    <td className="py-3 px-4 text-text-primary">
                      {flat.flat_no}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {flat.owner_name}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {flat.email || "—"}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {flat.phone || "—"}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {flat.type}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(flat)}
                        className="text-accent-primary hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(flat)}
                        className="text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-3 border-t border-border-default">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-border-default text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-text-muted text-sm">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-border-default text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-bg-card border border-border-default rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {modal === "add" ? "Add Flat" : "Edit Flat"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Flat No
                </label>
                <input
                  required
                  value={form.flat_no}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, flat_no: e.target.value }))
                  }
                  className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Owner Name
                </label>
                <input
                  required
                  value={form.owner_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, owner_name: e.target.value }))
                  }
                  className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1 ">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as "1BHK" | "2BHK" | "3BHK",
                    }))
                  }
                  className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                >
                  {FLAT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {modal === "add" && (
                <div className="border border-border-default rounded-lg p-4 bg-bg-glass/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Create owner login
                      </p>
                      <p className="text-xs text-text-muted">
                        Creates a resident user linked to this flat.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={createUser}
                      onChange={(e) => setCreateUser(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  {createUser && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Owner password
                      </label>
                      <input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Set a password for the resident"
                        className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                      />
                      <p className="text-xs text-text-muted mt-1">
                        The owner email from above will be used as the login
                        email.
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : modal === "add"
                      ? "Add"
                      : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    setEditing(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-border-default text-text-primary text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
  open={deleteModal.open}
  title="Delete Flat"
  message={`Are you sure you want to delete flat ${deleteModal.flat?.flat_no}?`}
  onCancel={() => setDeleteModal({ open: false, flat: null })}
  onConfirm={confirmDelete}
  loading={deleting}
/>
    </div>
  );
}
