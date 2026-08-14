import React from 'react';
import {cx} from "../utils/classNames.js"
import ArcheTable from "../components/craft/ArcheTable.jsx";

const Archemistery = (props) => {
  const {className, children, ...other} = props;

  return (
    <div className={cx("mx-auto max-w-5xl px-6 py-10 flex flex-col gap-3", className)}>
      <div>
        <h1 className="text-5xl font-bold text-white">
          Objectif
        </h1>

        <p className="mt-2 text-slate-400">
          Hop on travaille ici !
        </p>
      </div>

      <ArcheTable/>
    </div>
  );
}

export default Archemistery;