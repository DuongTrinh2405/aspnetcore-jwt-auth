import { useEffect, useState } from "react";
import InteractionForm from "../components/Interaction/InteractionForm";
import InteractionTable from "../components/Interaction/InteractionTable";
import { getInteractions } from "../services/interactionService";

function Interactions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInteractions();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-page min-h-screen">
      <h2>Interactions</h2>

      <InteractionForm onSuccess={loadData} />

      <InteractionTable
        data={data}
        loading={loading}
        onReload={loadData}
      />
    </div>
  );
}

export default Interactions;