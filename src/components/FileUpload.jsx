import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponse(null);
    setError('');
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
    setResponse(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !mode) {
      setError('Please select both file and import mode.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    try {
      setLoading(true);
      const res = await axios.post(
        'https://company-import-backend.onrender.com/api/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Error uploading file');
      } else {
        setError('Error uploading file');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Company Importer</h2>
      <div className="form-containaer">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fileInput">Select File:</label>
          <input id="fileInput" type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
        </div>
        <div className="form-group">
          <label htmlFor="modeSelect">Import Mode:</label>
          <select id="modeSelect" value={mode} onChange={handleModeChange}>
            <option value="">-- Select Import Mode --</option>
            <option value="mode1">1. Create New Companies</option>
            <option value="mode2">2. Create + Update (No Overwrite)</option>
            <option value="mode3">3. Create + Update (With Overwrite)</option>
            <option value="mode4">4. Update Only (No Overwrite)</option>
            <option value="mode5">5. Update Only (With Overwrite)</option>
          </select>
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      {error && <p className="error">{error}</p>}
      </form>
      </div>


      {response && (
        <div className="summary">
          <h3>Import Summary</h3>
          <p><strong>Status:</strong> {response.status}</p>
          <p><strong>Mode:</strong> {response.mode}</p>
          <p><strong>Inserted:</strong> {response.inserted}</p>
          <p><strong>Updated:</strong> {response.updated}</p>
          <p><strong>Skipped:</strong> {response.skipped}</p>

          {response.skippedRows.length > 0 && (
            <div className="table-container">
              <h4>Skipped Rows Details</h4>
              <table>
                <thead>
                  <tr>
                    <th>Row#</th>
                    <th>Reason</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {response.skippedRows.map((rowInfo, idx) => (
                    <tr key={idx}>
                      <td>{rowInfo.row}</td>
                      <td>{rowInfo.reason}</td>
                      <td><pre>{JSON.stringify(rowInfo.data, null, 2)}</pre></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
