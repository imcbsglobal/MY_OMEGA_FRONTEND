// src/components/TargetManagement/ProductMaster.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from "../../api/client";

const ProductMaster = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_code: '',
    description: '',
    unit: 'Pcs',
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/target-management/products/');
      setProducts(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await api.put(`/target-management/products/${editingProduct.id}/`, formData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/target-management/products/', formData);
        toast.success('Product created successfully');
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        product_name: '',
        product_code: '',
        description: '',
        unit: 'Pcs',
        is_active: true
      });
      fetchProducts();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message ||
                       'Operation failed';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_code: product.product_code,
      description: product.description || '',
      unit: product.unit || 'Pcs',
      is_active: product.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/target-management/products/${id}/`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      product_code: '',
      description: '',
      unit: 'Pcs',
      is_active: true
    });
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <div className="d-flex align-items-center justify-content-between">
                <h6>Product Master</h6>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddNew}
                >
                  + Add New Product
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Product Name
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Product Code
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Unit
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Description
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Status
                      </th>
                      <th className="text-secondary opacity-7">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No products found. Click "Add New Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      products.map(product => (
                        <tr key={product.id}>
                          <td>
                            <p className="text-sm font-weight-bold mb-0">{product.product_name}</p>
                          </td>
                          <td>
                            <p className="text-sm text-secondary mb-0">{product.product_code}</p>
                          </td>
                          <td>
                            <span className="badge badge-sm bg-gradient-info">{product.unit}</span>
                          </td>
                          <td>
                            <p className="text-xs text-secondary mb-0">
                              {product.description || '-'}
                            </p>
                          </td>
                          <td className="align-middle text-center">
                            <span className={`badge badge-sm ${product.is_active ? 'bg-gradient-success' : 'bg-gradient-secondary'}`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="align-middle">
                            <button
                              className="btn btn-link text-secondary mb-0"
                              onClick={() => handleEdit(product)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-link text-danger mb-0"
                              onClick={() => handleDelete(product.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="product_name"
                      className="form-control"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Product Code *</label>
                    <input
                      type="text"
                      name="product_code"
                      className="form-control"
                      value={formData.product_code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Unit *</label>
                    <select
                      name="unit"
                      className="form-select"
                      value={formData.unit}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Pcs">Pieces (Pcs)</option>
                      <option value="Kg">Kilogram (Kg)</option>
                      <option value="Box">Box</option>
                      <option value="Ltr">Liter (Ltr)</option>
                      <option value="Mtr">Meter (Mtr)</option>
                      <option value="Dozen">Dozen</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="is_active"
                      className="form-check-input"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      id="isActiveCheck"
                    />
                    <label className="form-check-label" htmlFor="isActiveCheck">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMaster;