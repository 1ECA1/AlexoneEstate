
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ImagePlus,
  Save,
  X,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../hooks/useAuth";

import {
  createProperty,
  fetchMyProperties,
  updateProperty,
  uploadPropertyImages,
} from "../../services/propertyService";

import { fetchAdminProperties } from "../../services/adminService";

const initialForm = {
  title: "",
  description: "",
  location: "",
  price: "",
  pricePeriod: "none",
  status: "For Sale",
  type: "Apartment",
  bedrooms: "0",
  bathrooms: "0",
  area: "0",
};

const fieldClass =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#20251f] outline-none transition placeholder:text-stone-400 focus:border-[#a17b38] focus:ring-2 focus:ring-[#a17b38]/10";

const labelClass = "text-sm font-semibold text-[#20251f]";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getErrorMessage(error) {
  const data = error.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }

  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return (
      data?.message ||
      "You do not have permission to manage this property."
    );
  }

  return (
    data?.message ||
    error.message ||
    "Something went wrong. Please check your details and try again."
  );
}

export default function PropertyForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine the dashboard using the authenticated role and current route.
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    location.pathname.startsWith("/admin");

  const dashboardPath = isAdmin ? "/admin" : "/agent";

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the property using the correct service for the current role.
  useEffect(() => {
    if (!isEditing) {
      setLoadingProperty(false);
      return;
    }

    let cancelled = false;

    async function loadProperty() {
      setLoadingProperty(true);
      setError("");

      try {
        const properties = isAdmin
          ? await fetchAdminProperties()
          : await fetchMyProperties();

        const property = properties.find(
          (item) => String(item.id) === String(id)
        );

        if (!property) {
          if (!cancelled) {
            setError(
              isAdmin
                ? "Property not found. Please return to the admin dashboard and try again."
                : "This property was not found in your listings. You can only edit your own properties."
            );
          }

          return;
        }

        if (cancelled) return;

        setForm({
          title: property.title || "",
          description: property.description || "",
          location: property.location || "",
          price: String(property.price ?? ""),
          pricePeriod: property.pricePeriod || "none",
          status: property.status || "For Sale",
          type: property.type || "Apartment",
          bedrooms: String(property.bedrooms ?? 0),
          bathrooms: String(property.bathrooms ?? 0),
          area: String(property.area ?? 0),
        });

        setImages(
          Array.isArray(property.images)
            ? property.images.map((image) =>
                typeof image === "string" ? image : image.url
              ).filter(Boolean)
            : []
        );
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingProperty(false);
        }
      }
    }

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing, isAdmin]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || []);

    // Allow the same file to be selected again.
    event.target.value = "";

    if (files.length === 0) return;

    setError("");

    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can add up to ${MAX_IMAGES} photos per property.`);
      return;
    }

    if (files.some((file) => !ALLOWED_TYPES.includes(file.type))) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      setError("Each photo must be 5 MB or smaller.");
      return;
    }

    setUploading(true);

    try {
      const uploaded = await uploadPropertyImages(files);

      setImages((current) => [
        ...current,
        ...uploaded.map((image) =>
          typeof image === "string" ? image : image.url
        ).filter(Boolean),
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    setImages((current) => current.filter((item) => item !== url));
  }

  function makeCover(url) {
    setImages((current) => [
      url,
      ...current.filter((item) => item !== url),
    ]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const price = Number(form.price);
    const bedrooms = Number(form.bedrooms);
    const bathrooms = Number(form.bathrooms);
    const area = Number(form.area);

    if (!form.title.trim() || form.title.trim().length < 5) {
      setError("The property title must contain at least 5 characters.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter the property location.");
      return;
    }

    if (!form.type.trim()) {
      setError("Please enter the property type.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Enter a valid price that is zero or greater.");
      return;
    }

    if (
      [bedrooms, bathrooms, area].some(
        (value) => !Number.isFinite(value) || value < 0
      )
    ) {
      setError("Bedrooms, bathrooms, and area cannot be negative.");
      return;
    }

    if (uploading) {
      setError("Please wait for your photos to finish uploading.");
      return;
    }

    if (images.length === 0) {
      setError("Please add at least one photo of the property.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      price,
      pricePeriod: form.pricePeriod,
      status: form.status,
      type: form.type.trim(),
      bedrooms,
      bathrooms,
      area,
      images,
    };

    setSaving(true);

    try {
      if (isEditing) {
        await updateProperty(id, payload);
      } else {
        await createProperty(payload);
      }

      const notice = isEditing
        ? isAdmin
          ? "Property updated successfully."
          : "Property updated. It may require approval again."
        : isAdmin
          ? "Property created successfully."
          : "Property submitted successfully. It is now awaiting approval.";

      navigate(dashboardPath, {
        replace: true,
        state: { notice },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to={dashboardPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-[#20251f]"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
            Property management
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {isEditing ? "Edit Property" : "Add New Property"}
          </h1>

          <p className="mt-3 text-sm leading-7 text-stone-500">
            {isEditing
              ? "Update the property details and photos below."
              : "Provide accurate property details to create your listing."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700"
          >
            {error}
          </div>
        )}

        {loadingProperty ? (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
            Loading property details...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-8 rounded-3xl border border-stone-200/80 bg-white p-5 sm:p-8"
          >
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5f2e9] text-[#8c6b2e]">
                  <Building2 size={20} />
                </span>

                <div>
                  <h2 className="font-semibold">Basic information</h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Describe the property clearly.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className={labelClass}>Property title *</span>
                  <input
                    className={fieldClass}
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Modern 3-bedroom apartment"
                    minLength={5}
                    maxLength={120}
                    required
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Location *</span>
                  <input
                    className={fieldClass}
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Wuse 2, Abuja"
                    required
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Description</span>
                  <textarea
                    className={`${fieldClass} min-h-32 resize-y`}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the features, amenities, and surroundings..."
                    maxLength={3000}
                    rows={5}
                  />
                  <span className="mt-1 block text-right text-xs text-stone-400">
                    {form.description.length}/3000
                  </span>
                </label>

                <label>
                  <span className={labelClass}>Property type *</span>
                  <select
                    className={fieldClass}
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                  >
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Duplex</option>
                    <option>Terrace</option>
                    <option>Land</option>
                    <option>Commercial</option>
                    <option>Office</option>
                    <option>Studio</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  <span className={labelClass}>Listing type *</span>
                  <select
                    className={fieldClass}
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                    <option value="Shortlet">Shortlet</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="border-t border-stone-100 pt-7">
              <h2 className="font-semibold">Pricing</h2>
              <p className="mt-1 text-xs text-stone-500">
                Enter the price in Nigerian naira.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Price (₦) *</span>
                  <input
                    className={fieldClass}
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 85000000"
                    min="0"
                    step="any"
                    required
                  />
                </label>

                <label>
                  <span className={labelClass}>Price period</span>
                  <select
                    className={fieldClass}
                    name="pricePeriod"
                    value={form.pricePeriod}
                    onChange={handleChange}
                  >
                    <option value="none">One-time / no period</option>
                    <option value="night">Per night</option>
                    <option value="month">Per month</option>
                    <option value="year">Per year</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="border-t border-stone-100 pt-7">
              <h2 className="font-semibold">Property specifications</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <label>
                  <span className={labelClass}>Bedrooms</span>
                  <input
                    className={fieldClass}
                    type="number"
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={handleChange}
                    min="0"
                    step="1"
                  />
                </label>

                <label>
                  <span className={labelClass}>Bathrooms</span>
                  <input
                    className={fieldClass}
                    type="number"
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={handleChange}
                    min="0"
                    step="1"
                  />
                </label>

                <label>
                  <span className={labelClass}>Area (m²)</span>
                  <input
                    className={fieldClass}
                    type="number"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    min="0"
                    step="any"
                  />
                </label>
              </div>
            </section>

            <section className="border-t border-stone-100 pt-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5f2e9] text-[#8c6b2e]">
                  <ImagePlus size={20} />
                </span>

                <div>
                  <h2 className="font-semibold">Property photos</h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Up to {MAX_IMAGES} photos. JPG, PNG or WebP, 5 MB each.
                    The first photo is the cover image.
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((url, index) => (
                    <li
                      key={`${url}-${index}`}
                      className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100"
                    >
                      <img
                        src={url}
                        alt={`Property photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-[#20251f]/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                          Cover
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        aria-label={`Remove photo ${index + 1}`}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-700 transition hover:bg-white hover:text-rose-600"
                      >
                        <X size={16} />
                      </button>

                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeCover(url)}
                          className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#20251f] transition hover:bg-white"
                        >
                          Make cover
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <label
                className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-[#faf9f6] px-4 py-8 text-center text-sm transition hover:border-[#a17b38] ${
                  uploading || images.length >= MAX_IMAGES
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
              >
                <ImagePlus size={24} className="text-[#a17b38]" />

                <span className="font-semibold">
                  {uploading ? "Uploading..." : "Click to choose photos"}
                </span>

                <span className="text-xs text-stone-500">
                  {images.length}/{MAX_IMAGES} added
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={handleFilesSelected}
                  disabled={uploading || images.length >= MAX_IMAGES}
                />
              </label>
            </section>

            <div className="rounded-2xl bg-[#f8f6f0] p-4 text-sm leading-6 text-stone-600">
              <strong className="text-[#20251f]">
                Approval process:
              </strong>{" "}
              {isEditing
                ? isAdmin
                  ? "Your changes will be saved using your administrator permissions."
                  : "Saving your changes may return the listing to pending approval."
                : isAdmin
                  ? "Your property will be created using administrator permissions."
                  : "Your new listing will remain pending until an administrator approves it."}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to={dashboardPath}
                className="rounded-full border border-stone-200 px-6 py-3 text-center text-sm font-semibold transition hover:bg-stone-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || uploading || loadingProperty}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#343a32] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Submit Property"}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
