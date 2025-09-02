// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import CornMoistureChartRecharts from '../components/CornMoistureChartRecharts';
import DataInput from '../components/DataInput';
import StatisticsTable from '../components/StatisticsTable';
import InterfaceResults from '../components/InterfaceResults';
import { fetchResultsByQueue, fetchInterfaceSummary } from '../services/dataService';
import { startDataCollection } from '../services/moistureSensorService';

export default function Home() {
  // --- State ---
  const [rawInput, setRawInput]                   = useState('');
  const [queue, setQueue]                         = useState('');
  const [chartData, setChartData]                 = useState([]);
  const [statisticsRows, setStatisticsRows]       = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [intervalId, setIntervalId]               = useState(null);

  // Interface Results
  const [interfaceResults, setInterfaceResults]   = useState([]);
  const [interfaceFilter, setInterfaceFilter]     = useState(null);
  const [interfaceIntervalId, setInterfaceIntervalId] = useState(null);

  // helper ฟังก์ชัน format จำนวน
  const fmt = num => (typeof num === 'number' ? num.toFixed(2) : num);

  // --- Fetch & update statistics/chart ---
  const handleFetchData = async (q) => {
    setLoading(true);
    try {
      const rows = await fetchResultsByQueue(q);
      if (Array.isArray(rows) && rows.length) {
        // update chart
        const allPreds = rows[0].result.predictions || [];
        setChartData(allPreds.map(i => ({ id: i.id, prediction: i.prediction })));

        // build latest 3 statistics
        const latestThree = rows.slice(0, 3);
        const statsRows = latestThree.map(r => {
          const s = r.statistics;
          return {
            id:       r.id,
            N:        fmt(s.N),
            Min:      fmt(s.min),
            Max:      fmt(s.max),
            Range:    fmt(s.range),
            Average:  fmt(s.average),
            SD:       fmt(s.SD),
            CV:       fmt(s.CV),
            Median:   fmt(s.median),
            Skewness: s.skewness != null ? fmt(s.skewness) : '–',
            Kurtosis: s.kurtosis != null ? fmt(s.kurtosis) : '–',
            Variance: fmt(s.variance),
          };
        });
        setStatisticsRows(statsRows);

        // clear old interval
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    } catch (err) {
      console.error("Error fetching data for queue", q, err);
    } finally {
      setLoading(false);
    }
  };

  const startDataFetchInterval = (q) => {
    const id = setInterval(() => handleFetchData(q), 10000);
    setIntervalId(id);
  };

  // --- เริ่ม data collection + ตั้ง filter สำหรับ interface ---
  const handleStart = async () => {
    const input = rawInput.trim();
    if (input.length < 79) {
      alert('ข้อมูลไม่ครบตามตำแหน่งที่กำหนด (ต้องมีความยาว ≥ 79)');
      return;
    }
    // parse input
    const q        = input.substring(0, 14);
    const insLot   = input.substring(26, 37);
    const batch    = input.substring(38, 48);
    const plant    = input.substring(49, 53);
    const material = input.substring(54, 64);
    const sampleNo = input.substring(75, 79);

    // reset state
    setQueue(q);
    setStatisticsRows([]);
    setChartData([]);
    setInterfaceResults([]);
    setInterfaceFilter({
      ins_lot: insLot,
      material,
      batch,
      plant,
      sample_no: sampleNo
    });

    try {
      await startDataCollection({ queue: q, ins_lot: insLot, material, batch, plant, sample_no: sampleNo });
      // initial fetch + interval polling
      setTimeout(() => {
        handleFetchData(q);
        startDataFetchInterval(q);
      }, 10000);
    } catch (err) {
      console.error('Error starting data collection:', err);
    }
  };

  // --- Polling InterfaceResults ---
  useEffect(() => {
    if (!interfaceFilter) return;

    const updateLatest = (data) => {
      if (Array.isArray(data) && data.length) {
        const latest = data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
        setInterfaceResults([latest]);
      } else {
        setInterfaceResults([]);
      }
    };

    fetchInterfaceSummary(interfaceFilter)
      .then(updateLatest)
      .catch(console.error);

    const id = setInterval(() => {
      fetchInterfaceSummary(interfaceFilter)
        .then(updateLatest)
        .catch(console.error);
    }, 10000);
    setInterfaceIntervalId(id);

    return () => clearInterval(id);
  }, [interfaceFilter]);

  // --- Cleanup intervals on unmount/change ---
  useEffect(() => () => {
    if (intervalId) clearInterval(intervalId);
  }, [intervalId]);

  useEffect(() => () => {
    if (interfaceIntervalId) clearInterval(interfaceIntervalId);
  }, [interfaceIntervalId]);

  // --- ลบแถว statistics ---
  const handleDelete = (id) => {
    setStatisticsRows(prev => prev.filter(r => r.id !== id));
  };

  // --- Render ---
  return (
    <div className="home-page px-4 sm:px-6 lg:px-8 mt-6">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-600">
        Moisture Real Time Data
      </h2>

      <DataInput
        rawInput={rawInput}
        setRawInput={setRawInput}
        onStart={handleStart}
        loading={loading}
      />

      <CornMoistureChartRecharts
        chartData={chartData}
        queue={queue}
        loading={loading}
      />

      <div className="mt-8 bg-white rounded-lg shadow p-6 border-2 border-gray-800">
        <StatisticsTable
          rows={statisticsRows}
          onDelete={handleDelete}
        />

        <hr className="my-6 border-gray-200" />

        <InterfaceResults
          data={interfaceResults}
          onInterface={() => {
            console.log('Interface button clicked for', interfaceResults[0]?.id);
          }}
        />
      </div>
    </div>
  );
}
