"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./utils/AuthContext";
import { Status, Task as TaskType } from "@/types";
import Task from "@/components/Task";
import AddTaskDialog from "@/components/AddTaskDialog";
import API from "./utils/api";
import UpdateTaskDialog from "@/components/UpdateTaskDialog";

export default function Home() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskType[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState<TaskType | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");

  useEffect(() => {
    API.get("/tasks/get-all")
      .then((res: any) => {
        console.log(res.data.tasks);
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    setFilteredTasks(
      tasks.filter((t) => (filter == "all" ? true : t.status === filter))
    );
  }, [filter, tasks]);

  const deleteTask = async (id: number) => {
    try {
      await API.get(`/tasks/delete?id=${id}`);

      console.log("Task deleted successfullly");
      setTasks((val) => val.filter((t) => t.id !== id));
      close();
    } catch (err: any) {
      alert("Unexpected server error :(");
      console.error(err);
    }
  };

  return (
    <div className="p-4 pb-20 gap-16 sm:py-10 w-[700px]">
      <div className="flex gap-3 items-center">
        <span className="text-2xl flex-1 overflow-hidden text-ellipsis">
          {user?.name}
        </span>
        <button
          className="text-2xl border rounded-md px-3 py-1 hover:brightness-75 active:brightness-90"
          onClick={() => logout()}
        >
          Log out
        </button>
      </div>
      <div className="flex flex-col gap-3 text-center text-2xl mt-7">
        <h2 className="font-bold">Your Tasks</h2>
        <div className="flex justify-between">
          <button
            className="text-xl bg-gray-800 px-3 py-1 rounded-md hover:bg-gray-700 active:bg-gray-800 transition"
            onClick={() => {
              setIsAddTaskDialogOpen(true);
            }}
          >
            + NEW
          </button>
          <select
            value={filter}
            className="bg-gray-900 p-2 rounded-md"
            onChange={(e) => setFilter(e.target.value as Status)}
          >
            <option value="all">all</option>
            <option value="todo">todo</option>
            <option value="in-progress">in progress</option>
            <option value="done">done</option>
          </select>
        </div>
        <ul>
          {tasks.length ? (
            filteredTasks.map((t) => (
              <Task
                key={t.id}
                task={t}
                onDelete={() => deleteTask(t.id)}
                onUpdate={() => setTaskToUpdate(t)}
              />
            ))
          ) : (
            <span className="text-center text-xl">No tasks yet</span>
          )}
        </ul>
      </div>
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        closeFn={() => setIsAddTaskDialogOpen(false)}
        onSuccess={(task) => setTasks((val) => [...val, task])}
      />

      {taskToUpdate && (
        <UpdateTaskDialog
          task={taskToUpdate}
          isOpen={taskToUpdate !== null}
          closeFn={() => setTaskToUpdate(null)}
          onSuccess={(task) =>
            setTasks((val) =>
              val.map((t) => {
                if (t.id === task.id) return task;
                return t;
              })
            )
          }
        />
      )}
    </div>
  );
}
