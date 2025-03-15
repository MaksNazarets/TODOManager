"use client";

import API from "@/app/utils/api";
import { Status, Task } from "@/types";
import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  closeFn: () => void;
  onSuccess: (task: Task) => void;
}

function AddTaskDialog({ isOpen, closeFn, onSuccess }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("todo");

  const close = () => {
    closeFn();
    setTitle("");
    setDescription("");
    setStatus("todo");
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post("/tasks/new", { title, description, status });

      console.log("Task created successfullly");
      onSuccess(res.data.newTask);
      close();
    } catch (err: any) {
      alert("Unexpected server error :(");
      console.error(err);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed bg-gray-900 rounded-xl border-2 border-gray-700 text-foreground shadow-xl transition duration-200 overflow-hidden bubble-fade-in mx-auto translate-y-1/2"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => handleBackdropClick(e)}
    >
      <div className="flex flex-col gap-5 size-full w-[650px] h-[400px] px-8 py-6">
        <span className="text-center text-3xl">New task</span>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="custom-input"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="custom-input flex-1"
          required
        ></textarea>
        <select
          value={status}
          className="bg-gray-800 p-2 rounded-md text-2xl"
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          <option value="todo">todo</option>
          <option value="in-progress">in progress</option>
          <option value="done">done</option>
        </select>
        <button
          type="submit"
          className="mt-3 text-[1.4rem] bg-gray-600 p-2 rounded-md hover:bg-gray-700 active:bg-gray-700 transition"
          onClick={(e) => handleSubmit(e)}
        >
          Confirm
        </button>
      </div>
    </dialog>
  );
}
export default AddTaskDialog;
