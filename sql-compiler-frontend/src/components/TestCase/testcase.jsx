import React, { useState } from "react";
import "./testcase.css";

const TestCase = ({ id, status }) => {
  const getStatusColor = (status) => (status ? "green" : "red");
  return (
    <div className="testcase">
      <h6 className="testcase-no">{`Testcase ${id}`}</h6>
      <p
        className="testcase-status"
        style={{ background: getStatusColor(status) }}
      >
        {status ? "Passed" : "Failed"}
        
      </p>
    </div>
  );
};

export default TestCase;
