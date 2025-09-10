import React from "react";
import InputField from "../common/InputField";
import Button from "../common/Button";

const SURVEY_TYPES = ["FEEDBACK", "EXAM"];
const SURVEY_RESPONSE_TYPES = ["ALL_IN_ONE_PAGE", "ONE_BY_ONE"];

// Fonction utilitaire pour transformer les valeurs en labels lisibles
const toLabel = (value) => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const SurveyForm = ({ form, setForm, onSubmit, loading, error }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 p-4 border rounded bg-white shadow">
      <InputField
        id="title"
        label="Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <InputField
        id="description"
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        as="textarea"
        className="resize-y"
        disabled={loading}
      />

      {/* Survey Type */}
      <label className="block font-semibold mb-1" htmlFor="type">Type</label>
      <select
        id="type"
        name="type"
        value={form.type}
        onChange={handleChange}
        className="mb-4 p-2 border rounded w-full"
        disabled={loading}
      >
        {SURVEY_TYPES.map((t) => (
          <option key={t} value={t}>
            {toLabel(t)}
          </option>
        ))}
      </select>

      {/* Survey Response Type */}
      <label className="block font-semibold mb-1" htmlFor="responseType">Display Type</label>
      <select
        id="responseType"
        name="responseType"
        value={form.responseType}
        onChange={handleChange}
        className="mb-4 p-2 border rounded w-full"
        disabled={loading}
      >
        {SURVEY_RESPONSE_TYPES.map((t) => (
          <option key={t} value={t}>
            {toLabel(t)}
          </option>
        ))}
      </select>

      <InputField
        id="deadline"
        label="Date limite"
        name="deadline"
        type="datetime-local"
        value={form.deadline}
        onChange={e => setForm({...form, deadline: e.target.value})}
        disabled={loading}
      />

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="flex justify-center gap-4 mt-6">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-40 text-center justify-center"
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default SurveyForm;
