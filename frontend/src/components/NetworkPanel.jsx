export default function NetworkPanel({ data }) {
  if (!data || data.error) return <div className="panel"><p>{data?.error || "No data"}</p></div>;
  return (
    <div className="panel">
      <h3>🕸 Network Analysis</h3>
      <p className="panel-desc">
        Models payment relationships as a graph. Highly connected nodes may indicate
        collusion rings, shell companies, or fraudulent vendor networks.
      </p>
      <div className="stat-row">
        <div className="stat"><strong>{data.node_count}</strong><br/>Nodes</div>
        <div className="stat"><strong>{data.edge_count}</strong><br/>Connections</div>
        <div className="stat"><strong>{data.suspicious_node_count}</strong><br/>Suspicious Nodes</div>
        <div className="stat"><span className={`risk-badge ${data.risk}`}>{data.risk}</span><br/>Risk</div>
      </div>
      <h4 style={{fontSize:13, margin:"16px 0 8px"}}>Most Suspicious Nodes</h4>
      <table className="data-table">
        <thead>
          <tr><th>Entity</th><th>Type</th><th>Connections</th><th>Total Amount (USD)</th><th>Risk Score</th></tr>
        </thead>
        <tbody>
          {data.suspicious_nodes?.map((n, i) => (
            <tr key={i}>
              <td style={{fontWeight: n.suspicious ? 600 : 400}}>{n.label}</td>
              <td>{n.type}</td>
              <td>{n.connections}</td>
              <td>${n.total_amount_usd?.toLocaleString()}</td>
              <td style={{color: n.suspicious ? "#c0392b" : "#27ae60", fontWeight:600}}>{n.risk_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
