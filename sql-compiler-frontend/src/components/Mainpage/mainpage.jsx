import React, { useState, useEffect } from "react";
import SQLEditor from "../SQLEditor/SQLEditor";
import axios from "axios";
import "./mainpage.css";
import TestCase from "../TestCase/testcase";

const testCases = [
  {
    id: 1,
    query: "SELECT first_name FROM employees", //**********
    expectedResult: [
      { first_name: "John" },
      { first_name: "Bob" },
      { first_name: "Alice" },
      { first_name: "Alice" },
      { first_name: "Eve" },
      { first_name: "Jane" },
    ],
    isPassed: false,
  },
  {
    id: 2,
    query: "SELECT last_name FROM employees WHERE department_id = 1",//**********
    expectedResult: [{ last_name: "Doe" }, { last_name: "Johnson" },{ last_name: "Smith" }],
    isPassed: false,
  },
  {
    id: 3,
    query:
      "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)",
    expectedResult: [
      {
        employee_id: 4,
        first_name: "Alice",
        last_name: "Davis",
        department_id: 2,
        salary: 75000,
      },
      {
        employee_id: 4,
        first_name: "Alice",
        last_name: "Davis",
        department_id: 2,
        salary: 75000,
      },
      {
        employee_id: 6,
        first_name: "Eve",
        last_name: "Wilson",
        department_id: 2,
        salary: 70000,
      },
      {
        employee_id: 2,
        first_name: "Jane",
        last_name: "Smith",
        department_id: 1,
        salary: 80000,
      },
    ],
    isPassed: false,
  },
  {
    id: 4,
    query:
      "SELECT department_id, COUNT(*) as num_employees FROM employees GROUP BY department_id",
    expectedResult: [
      { department_id: 1, num_employees: 3 },
      { department_id: 2, num_employees: 3 },
      
    ],
    isPassed: false,
  },
  {
    id: 5,
    query: "SELECT first_name, last_name FROM employees WHERE salary > 100000",
    expectedResult: [
      // { first_name: "John", last_name: "Doe" },
      // { first_name: "Bob", last_name: "Johnson" },
    ],
    isPassed: false,
  },
];

const MainPage = () => {
  const [tableSchema, setTableSchema] = useState([]);
  const [initialTableData, setInitialTableData] = useState({});
  const [error, setError] = useState(null);
  const [testcaseStatus, setTestcaseStatus] = useState({});
  const [userQuery, setUserQuery] = useState("");
  console.log(userQuery)
  const fetchTableSchema = async () => {
    try {
      const response = await axios.post(`http://localhost:3001/table-schema`, {
        tableName: "employees",
      });
      setTableSchema(response.data.data);
    } catch (error) {
      console.error("Error fetching schema:", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/tables");
      const tables = response.data.data;
      const tableDataPromises = tables.map(async (table) => {
        const response = await axios.post("http://localhost:3001/table-data", {
          tableName: table,
        });
        return { [table]: response.data.data };
      });
      const tableDataResults = await Promise.all(tableDataPromises);
      const updatedTableData = tableDataResults.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setInitialTableData(updatedTableData);
      setError(null);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.error
          : "Error fetching initial table data"
      );
    }
  };

  const executeTestCase = async (query) => {
    try {
      const response = await axios.post("http://localhost:3001/execute-query", {
        query,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error executing query:", error);
      return null;
    }
  };

  const compareResults = (actualResult, expectedResult) => {
    return JSON.stringify(actualResult) === JSON.stringify(expectedResult);
  };

  const checkTestCases = async (query) => { 
    const results = await Promise.all(
      testCases.map(async (testCase) => {
        const actualResult = await executeTestCase(query); 
        const isPassed = compareResults(actualResult, testCase.expectedResult);
        return { ...testCase, isPassed };
      })
    );

    const updatedTestcaseStatus = results.reduce((acc, testCase) => {
      acc[`case${testCase.id}`] = testCase.isPassed;
      return acc;
    }, {});
    

    setTestcaseStatus(updatedTestcaseStatus);
  };

  const resetTestCases = () => {
    const initialTestCaseStatus = testCases.reduce((acc, testCase) => {
      acc[`case${testCase.id}`] = false;
      return acc;
    }, {});
    setTestcaseStatus(initialTestCaseStatus);
  };

  useEffect(() => {
    fetchInitialData();
    fetchTableSchema();
    resetTestCases();
  }, []);

  const renderTable = (data) => (
    <table className="results-table">
      <thead>
        <tr>
          {Object.keys(data[0] || {}).map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, idx) => (
              <td key={idx}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSchemaTable = () => (
    <table className="schema-table">
      <thead>
        <tr>
          <th>Column Name</th>
          <th>Data Type</th>
        </tr>
      </thead>
      <tbody>
        {tableSchema.map((column, index) => (
          <tr key={index}>
            <td>{column.COLUMN_NAME}</td>
            <td>{column.DATA_TYPE}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="main-page-container">
      <div className="left-side-container">
        <div className="question-container">
          <h1 className="question-header">
            QUESTIONS
          </h1>
          <p className="question-description">
          1. Write a SQL query to Display the first names of all employees.
          </p>
          <p className="question-description">2. Write a SQL query to display the last names 
            of employees who department id is one.
          </p>
          <p className="question-description">
          3. Write a SQL query to display all details of employees who earn more than the
           average salary in their department.
          </p>
          <p className="question-description">
          4. Write a SQL query to display the number of employees in each department_id .
           (hint: Display the count as “num_employees”).
          </p>
          <p className="question-description">
          5. Write a SQL query to find the first name and last name
           of employees who earn salary more than one lack.
          </p>
          <pre className="question-schema">employees table:</pre>
          {renderSchemaTable()}
          <h2>Initial Data</h2>
          {error && <div className="error-message">{error}</div>}
          {Object.keys(initialTableData).length > 0 ? (
            Object.keys(initialTableData).map((table) => (
              <div key={table}>
                <h3>{table}</h3>
                {renderTable(initialTableData[table])}
              </div>
            ))
          ) : (
            <p>No initial data available</p>
          )}
        </div>
        <div className="testcase-container">
          <h1 className="testcase-title">Test Cases</h1>
          {Object.keys(testcaseStatus).length > 0 ? (
            Object.keys(testcaseStatus).map((key, index) => (
              <TestCase
                key={index}
                id={index + 1}
                status={testcaseStatus[key]}
              />
            ))
          ) : (
            <p>Loading test cases...</p>
          )}
        </div>
      </div>
      <div className="right-side-container">
      <SQLEditor onExecute={(query) => setUserQuery(query)} /> {/* Modified to set user query */}
      <button onClick={() => checkTestCases(userQuery)}>Submit</button> {/* New button to run test cases */}
      </div>
    </div>
  );
};

export default MainPage;
