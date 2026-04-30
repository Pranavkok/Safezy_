'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { FetchContractorType } from '@/actions/admin/contractor';
import Spinner from '@/components/loaders/Spinner';
import { Pencil, Trash2, X, Check } from 'lucide-react';

type Product = { id: string; ppe_name: string; ppe_category: string };

type Assignment = {
  id: string;
  quantity: number;
  created_at: string;
  product: { id: string; ppe_name: string; ppe_category: string; image: string | null } | null;
};

type Props = {
  contractor: FetchContractorType;
  open: boolean;
  onClose: () => void;
};

export default function AssignPpeModal({ contractor, open, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Form state
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(1);
  const [editLoading, setEditLoading] = useState(false);
  const [revokeLoadingId, setRevokeLoadingId] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.ppe_name.toLowerCase().includes(search.toLowerCase()) ||
      p.ppe_category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;

    setLoadingProducts(true);
    fetch('/api/admin/products-list')
      .then((r) => r.json())
      .then(({ data }) => setProducts(data ?? []))
      .finally(() => setLoadingProducts(false));

    fetchAssignments();
  }, [open, contractor.id]);

  function fetchAssignments() {
    setLoadingAssignments(true);
    fetch(`/api/admin/ppe-assignments?contractor_id=${contractor.id}`)
      .then((r) => r.json())
      .then(({ data }) => setAssignments(data ?? []))
      .finally(() => setLoadingAssignments(false));
  }

  async function handleAssign() {
    if (!selectedProductId) return toast.error('Please select a PPE item.');
    if (quantity < 1) return toast.error('Quantity must be at least 1.');

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/ppe-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractor.id, product_id: selectedProductId, quantity })
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.error ?? 'Failed to assign PPE.');
      toast.success('PPE assigned successfully.');
      setSelectedProductId('');
      setQuantity(1);
      setSearch('');
      fetchAssignments();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSave(id: string) {
    if (editQty < 1) return toast.error('Quantity must be at least 1.');
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/ppe-assignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: editQty })
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.error ?? 'Failed to update.');
      toast.success('Quantity updated.');
      setEditingId(null);
      fetchAssignments();
    } finally {
      setEditLoading(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevokeLoadingId(id);
    try {
      const res = await fetch(`/api/admin/ppe-assignments/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) return toast.error(json.error ?? 'Failed to revoke.');
      toast.success('Assignment revoked.');
      fetchAssignments();
    } finally {
      setRevokeLoadingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Assign PPE — {contractor.first_name} {contractor.last_name}
          </DialogTitle>
        </DialogHeader>

        {/* ── Assign New PPE ── */}
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">Assign New PPE</h3>

          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {loadingProducts ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              size={Math.min(filteredProducts.length || 1, 6)}
            >
              <option value="">-- Select PPE --</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ppe_name} ({p.ppe_category})
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 whitespace-nowrap">Quantity:</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={submitting || !selectedProductId}
              className="ml-auto"
            >
              {submitting ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>

        {/* ── Current Assignments ── */}
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">Currently Assigned PPE</h3>

          {loadingAssignments ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No PPE assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 text-xs uppercase">
                    <th className="pb-2 pr-3">PPE Name</th>
                    <th className="pb-2 pr-3">Category</th>
                    <th className="pb-2 pr-3">Quantity</th>
                    <th className="pb-2 pr-3">Date Assigned</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{a.product?.ppe_name ?? '—'}</td>
                      <td className="py-2 pr-3 text-gray-500">{a.product?.ppe_category ?? '—'}</td>
                      <td className="py-2 pr-3">
                        {editingId === a.id ? (
                          <input
                            type="number"
                            min={1}
                            value={editQty}
                            onChange={(e) => setEditQty(parseInt(e.target.value) || 1)}
                            className="w-16 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        ) : (
                          a.quantity
                        )}
                      </td>
                      <td className="py-2 pr-3 text-gray-500 whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          {editingId === a.id ? (
                            <>
                              <button
                                onClick={() => handleEditSave(a.id)}
                                disabled={editLoading}
                                className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                                title="Save"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                disabled={editLoading}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                title="Cancel"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingId(a.id); setEditQty(a.quantity); }}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title="Edit quantity"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleRevoke(a.id)}
                                disabled={revokeLoadingId === a.id}
                                className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                                title="Revoke"
                              >
                                {revokeLoadingId === a.id ? <Spinner className="w-3 h-3" /> : <Trash2 size={15} />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
