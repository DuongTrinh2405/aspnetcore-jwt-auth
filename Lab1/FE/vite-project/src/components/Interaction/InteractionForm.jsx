import { useState } from "react";
import { createInteraction, updateInteraction } from "../../services/interactionService";
import { INTERACTION_TYPE } from "../../utils/interactionConstants";

function InteractionForm({ onSuccess, editing }) {
  const [form, setForm] = useState({
    customerId: "",
    propertyId: "",
    type: INTERACTION_TYPE.CALL,
    notes: "",
    date: new Date().toISOString().slice(0, 16),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "type" || name === "customerId" || name === "propertyId"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await updateInteraction(editing.id, {
          type: form.type,
          notes: form.notes,
          date: new Date(form.date).toISOString(),
        });
      } else {
        await createInteraction({
          customerId: form.customerId,
          propertyId: form.propertyId,
          type: form.type,
          notes: form.notes,
          date: new Date(form.date).toISOString(),
        });
      }

      onSuccess();
      alert("Success!");
    } catch (err) {
      console.error(err);
      alert("Error!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!editing && (
        <>
          <input
            name="customerId"
            placeholder="Customer ID"
            value={form.customerId}
            onChange={handleChange}
            required
          />

          <input
            name="propertyId"
            placeholder="Property ID"
            value={form.propertyId}
            onChange={handleChange}
            required
          />
        </>
      )}

      <select name="type" value={form.type} onChange={handleChange}>
        <option value={INTERACTION_TYPE.CALL}>Call</option>
        <option value={INTERACTION_TYPE.EMAIL}>Email</option>
        <option value={INTERACTION_TYPE.MEETING}>Meeting</option>
        <option value={INTERACTION_TYPE.MESSAGE}>Message</option>
        <option value={INTERACTION_TYPE.DEMO}>Demo</option>
        <option value={INTERACTION_TYPE.FOLLOW_UP}>Follow Up</option>
      </select>

      <input
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />

      <input
        type="datetime-local"
        name="date"
        value={form.date}
        onChange={handleChange}
      />

      <button type="submit">
        {editing ? "Update" : "Create"}
      </button>
    </form>
  );
}

export default InteractionForm;