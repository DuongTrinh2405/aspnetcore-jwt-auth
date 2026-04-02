import { INTERACTION_TYPE_LABEL } from "../../utils/interactionConstants";
import { deleteInteraction } from "../../services/interactionService";
import Loading from "../common/Loading";

function InteractionTable({ data = [], loading, onReload }) {
  if (loading) return <Loading />;

  if (!data.length) return <p>No interactions</p>;

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;

    try {
      await deleteInteraction(id);
      onReload();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Property</th>
          <th>Type</th>
          <th>Notes</th>
          <th>Date</th>
          <th>Employee</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((i) => (
          <tr key={i.id}>
            <td>{i.id}</td>
            <td>{i.customerId}</td>
            <td>{i.propertyId}</td>
            <td>{INTERACTION_TYPE_LABEL[i.type]}</td>
            <td>{i.notes}</td>
            <td>{new Date(i.date).toLocaleString()}</td>
            <td>{i.employeeId}</td>
            <td>
              <button onClick={() => handleDelete(i.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default InteractionTable;