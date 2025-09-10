import React, { useState, useEffect} from "react";
import InputField from "../common/InputField";
import Button from "../common/Button";

const QUESTION_TYPES = [
  "RATING_SCALE_ICONS",
  "FREE_TEXT",
  "DATE_PICKER",
  "MULTIPLE_CHOICE_TEXT",
  "SINGLE_CHOICE_TEXT",
  "MULTIPLE_CHOICE_IMAGE",
  "NUMERIC_SCALE",
  "YES_NO"
];

const QuestionForm = ({ onSubmit, onCancel, submitLabel = "Submit", loading, error, initialData }) => {
  const initialForm = initialData || {
    subject: "",
    questionText: "",
    questionType: QUESTION_TYPES[0],
    locked: false,
    options: [],
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
  if (initialData) {
    console.log("Initial options:", initialData.options);
    const correctedOptions = (initialData.options || []).map(opt => ({
      ...opt,
      correct: opt.correct === true || opt.correct === "true",
    }));
    setForm({ ...initialData, options: correctedOptions });
  }
}, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { optionText: "", optionScore: 0, isCorrect: false, isLocked: false },
      ],
    }));
  };

  const handleRemoveOption = (index) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setForm((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
      return { ...prev, options: updatedOptions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form); 
    setForm(initialForm); 
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white shadow">
      <InputField
        id="subject"
        label="Subject"
        name="subject"
        value={form.subject}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <InputField
        id="questionText"
        label="Question"
        name="questionText"
        value={form.questionText}
        onChange={handleChange}
        as="textarea"
        className="resize-y"
        required
        disabled={loading}
      />

      <label htmlFor="questionType" className="block font-semibold mb-1">Question type</label>
      <select
        id="questionType"
        name="questionType"
        value={form.questionType}
        onChange={handleChange}
        className="mb-4 p-2 border rounded w-full"
        disabled={loading}
      >
        {QUESTION_TYPES.map(type => (
          <option key={type} value={type}>
            {type.replace('_', ' ')}
          </option>
        ))}
      </select>

      <div className="mb-3 flex items-center">
        <input
          type="checkbox"
          id="locked"
          name="locked"
          checked={form.locked}
          onChange={handleChange}
          className="mr-2"
          disabled={loading}
        />
        <label htmlFor="locked" className="font-semibold">Lock question</label>
      </div>

      {!["FREE_TEXT", "DATE_PICKER"].includes(form.questionType) && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-700">Options</h4>
            <Button
              type="button"
              onClick={handleAddOption}
              variant="primary"
              disabled={loading}
            >
              Add option
            </Button>
          </div>

          {form.options.map((option, index) => (
            <div key={index} className="flex space-x-4 items-center">
              <input
                type="text"
                placeholder="Option text"
                value={option.optionText}
                onChange={(e) =>
                  handleOptionChange(index, "optionText", e.target.value)
                }
                className="input-base flex-grow"
              />
              <input
                type="number"
                placeholder="Score"
                value={option.optionScore}
                onChange={(e) =>
                  handleOptionChange(index, "optionScore", Number(e.target.value))
                }
                className="input-base w-10"
              />
              <label className="text-sm flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={option.correct}
                  onChange={(e) =>
                    handleOptionChange(index, "correct", e.target.checked)
                  }
                />
                <span>Correct</span>
              </label>
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="text-red-600 hover:text-red-800 text-lg font-bold px-1"
                aria-label="Supprimer option"
                title="Delete"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="flex gap-4 justify-center mt-4">
  {onCancel && (
    <Button type="button" onClick={onCancel} variant="secondary" disabled={loading}>
      Cancel
    </Button>
  )}
  <Button type="submit" disabled={loading}>
    {submitLabel || (initialData ? "Save Changes" : "Submit")}
  </Button>
</div>
    </form>
  );
};

export default QuestionForm;
