import { useState, useEffect } from 'react';

function TestPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:7001/api/v1/articles')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setData(data);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>测试页面</h1>
      {error && <p style={{ color: 'red' }}>错误: {error}</p>}
      {data ? (
        <div>
          <p>成功获取数据！</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  );
}

export default TestPage;
