export default function BenfordPanel({ data }) {
  if (!data || data.error) return <div className="panel"><p>{data?.error || "No data"}</p></div>;

  const maxVal = Math.max(...data.observed, ...data.expected);
  const barHeight = 160;

  return (
    <div className="panel">
      <h3>📊 Benford's Law Analysis</h3>
      <p className="panel-desc">
        Checks if first digits of transaction amounts follow the natural Benford distribution.
        Deviation indicates possible fabricated amounts.
      </p>

      <div className="stat-row">
        <div className="stat"><strong>{data.mad}</strong><br/>MAD Score</div>
        <div className="stat"><strong>{data.conformity}</strong><br/>Conformity</div>
        <div className="stat"><strong>{data.total_analysed}</strong><br/>Transactions</div>
        <div className="stat">
          <strong><span className={`risk-badge ${data.risk}`}>{data.risk}</span></strong>
          <br/>Risk Level
        </div>
      </div>

      <div className="benford-chart">
        {data.digits.map((d, i) => {
          const obsH = Math.round((data.observed[i] / maxVal) * barHeight);
          const expH = Math.round((data.expected[i] / maxVal) * barHeight);
          return (
            <div className="benford-bar-group" key={d}>
              <div className="benford-bar-wrap">
                <div className="bar-observed" style={{height: obsH, flex:1}} title={`Observed: ${(data.observed[i]*100).toFixed(1)}%`} />
                <div className="bar-expected" style={{height: expH, flex:1}} title={`Expected: ${(data.expected[i]*100).toFixed(1)}%`} />
              </div>
              <div className="bar-label">{d}</div>
            </div>
          );
        })}
      </div>

      <div className="chart-legend">
        <span><span className="legend-dot" style={{background:"#c0392b"}} />Observed</span>
        <span><span className="legend-dot" style={{background:"#2c4a8c", opacity:0.6}} />Expected (Benford)</span>
      </div>

      {data.top_deviations?.length > 0 && (
        <>
          <h4 style={{marginTop:20, marginBottom:8, fontSize:13}}>Top Deviating Digits</h4>
          <table className="data-table">
            <thead><tr><th>Digit</th><th>Observed</th><th>Expected</th><th>Deviation</th></tr></thead>
            <tbody>
              {data.top_deviations.map(d => (
                <tr key={d.digit}>
                  <td>{d.digit}</td>
                  <td>{(d.observed * 100).toFixed(2)}%</td>
                  <td>{(d.expected * 100).toFixed(2)}%</td>
                  <td style={{color:"#c0392b", fontWeight:600}}>{(d.deviation * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
