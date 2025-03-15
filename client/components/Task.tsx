"use client";

import { Status, Task as TaskType } from "@/types";
import { useState } from "react";

interface Props {
  task: TaskType;
  onUpdate: () => void;
  onDelete: () => void;
}

function Task({ task, onUpdate, onDelete }: Props) {
  return (
    <li
      className={`group text-left flex gap-4 p-3 mt-3 cursor-pointer border ${
        task.status === "done"
          ? "border-green-700"
          : task.status === "in-progress"
          ? "border-orange-200/50"
          : "border-gray-700"
      } rounded-lg`}
    >
      <div className="flex flex-col flex-1">
        <div className="font-bold overflow-hidden text-ellipsis">
          {task.title}
        </div>
        <div className="relative overflow-hidden text-ellipsis max-h-16">
          {task.description}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <div
          className={`w-35 p-2 rounded-md text-center border ${
            task.status === "done"
              ? "border-green-900 text-green-400"
              : task.status === "in-progress"
              ? "border-orange-200/50 text-orange-200"
              : "border-gray-700 text-gray-400"
          }`}
        >
          {task.status}
        </div>
        <div className="flex gap-1 w-full">
          <button
            className="bg-gray-600 px-2 flex-1 rounded-md hover:bg-gray-700"
            onClick={() => onUpdate()}
          >
            Update
          </button>
          <button
            className="bg-red-900 px-2 flex-1 w-full rounded-md hover:bg-red-700"
            onClick={() => onDelete()}
          >
            Del
          </button>
        </div>
      </div>
    </li>
  );
}

export default Task;
