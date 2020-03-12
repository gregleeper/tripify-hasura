import React from "react";

const DashboardCard = ({ data, title }) => {
  return (
    <div className="w-7/12 border-black border rounded">
      {data ? (
        <>
          <div className="border bg-gray-300 rounded">
            <h6 className="text-xl text-center">{title}</h6>
          </div>

          <div className="p-3 text-center w-1/8 ">
            <span className="bg-green-400 rounded-full py-2 px-3">
              {data.length}
            </span>
          </div>
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default DashboardCard;
