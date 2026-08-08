import React from 'react';

const Quest = (props) => {
  const {className, children, ...other} = props;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 flex flex-row gap-3">
      <div>
        <h1 className="text-5xl font-bold text-white">
          Objectif
        </h1>

        <p className="mt-2 text-slate-400">
          Hop on travaille ici !
        </p>
      </div>

    </div>
  );
}

export default Quest;