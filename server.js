const { useState } = React;

function App() {
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [jobName, setJobName] = useState('');
  const [scope, setScope] = useState('');
  const [markup, setMarkup] = useState(10); // percentage
  const [photoFiles, setPhotoFiles] = useState([]);

  // Result state
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    setPhotoFiles([...e.target.files]);
  };

  // Submit handler for generating the estimate
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEstimate(null);

    // Convert markup percentage to decimal
    const markupRate = parseFloat(markup) / 100;

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName,
          jobName,
          scope,
          markup: markupRate
        })
      });
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setEstimate(data);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while generating the estimate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleGenerate}>
        <label>
          Customer Name
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </label>
        <label>
          Job Name
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            required
          />
        </label>
        <label>
          Scope Description
          <textarea
            rows="4"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Describe the work to be performed"
            required
          ></textarea>
        </label>
        <label>
          Photo Upload
          <input type="file" multiple onChange={handleFileChange} />
        </label>
        <label>
          Markup (%)
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating…' : 'Generate Estimate'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {estimate && (
        <div>
          <h2>Estimate Results</h2>
          <h3>Materials</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Store</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {estimate.materials.map((m, index) => (
                <tr key={index}>
                  <td>{m.name}</td>
                  <td>{m.quantity}</td>
                  <td>${m.unitPrice.toFixed(2)}</td>
                  <td>{m.store}</td>
                  <td>${m.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Labor</h3>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Hours</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {estimate.labor.map((l, index) => (
                <tr key={index}>
                  <td>{l.task}</td>
                  <td>{l.hours}</td>
                  <td>${l.rate.toFixed(2)}</td>
                  <td>${l.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Totals</h3>
          <p>
            <strong>Materials:</strong> ${estimate.totals.materialTotal.toFixed(2)}
          </p>
          <p>
            <strong>Labor:</strong> ${estimate.totals.laborTotal.toFixed(2)}
          </p>
          <p>
            <strong>Markup:</strong> {(estimate.totals.markup * 100).toFixed(1)}%
          </p>
          <p>
            <strong>Final Total:</strong> ${estimate.totals.finalTotal.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}