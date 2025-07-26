"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FREQUENCY_OPTIONS } from "@/app/types/reminder";
import { toast } from "react-toastify";

const AddReminderPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateToRemember, setDateToRemember] = useState("");
  const [frequency, setFrequency] = useState("NEVER");
  const [shouldExpire, setShouldExpire] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const profileParam = queryParams.get("profileId");
    setProfileId(profileParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !dateToRemember) {
      toast.error("Title and Date are required.");
      return;
    }

    // Format dateToRemember to YYYY-MM-dd
    const formattedDate = new Date(dateToRemember).toISOString().slice(0, 10);

    // Show loading toast
    const loadingToast = toast.loading("Creating reminder...");

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          dateToRemember: formattedDate,
          frequency,
          shouldExpire,
          completed: false,
          userId,
          profileId,
        }),
      });

      if (response.ok) {
        toast.update(loadingToast, {
          render: "Reminder created successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.update(loadingToast, {
          render: `Failed to add reminder: ${errorData.error}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Failed to add reminder:", error);
      toast.update(loadingToast, {
        render: "An unexpected error occurred. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-6 md:mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
          Add New Reminder
        </h1>
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="title-mobile"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <input
                type="text"
                id="title-mobile"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Enter reminder title"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="description-mobile"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description-mobile"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Enter reminder description"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="dateToRemember-mobile"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Date to Remember
              </label>
              <input
                type="date"
                id="dateToRemember-mobile"
                value={dateToRemember}
                onChange={(e) => setDateToRemember(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="frequency-mobile"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Frequency
              </label>
              <select
                id="frequency-mobile"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="shouldExpire-mobile"
                checked={shouldExpire}
                onChange={(e) => setShouldExpire(e.target.checked)}
                className="w-4 h-4 mr-2 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="shouldExpire-mobile"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Should Expire
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700"
              >
                Add Reminder
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Form Section */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                  Reminder Details
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="title"
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Enter reminder title"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dateToRemember"
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Date to Remember *
                      </label>
                      <input
                        type="date"
                        id="dateToRemember"
                        value={dateToRemember}
                        onChange={(e) => setDateToRemember(e.target.value)}
                        className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="description"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      placeholder="Enter a detailed description for your reminder..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label
                        htmlFor="frequency"
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Frequency
                      </label>
                      <select
                        id="frequency"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      >
                        {FREQUENCY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center h-12">
                        <input
                          type="checkbox"
                          id="shouldExpire"
                          checked={shouldExpire}
                          onChange={(e) => setShouldExpire(e.target.checked)}
                          className="w-5 h-5 mr-3 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="shouldExpire"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Should Expire
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Link
                      href="/dashboard"
                      className="px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="px-8 py-3 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 transition-colors shadow-lg"
                    >
                      Create Reminder
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar with Additional Info */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Frequency Options
                </h3>
                <div className="space-y-3">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="font-medium text-gray-800 dark:text-white text-sm">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-200 mb-4">
                  💡 Tips
                </h3>
                <ul className="space-y-2 text-sm text-violet-700 dark:text-violet-300">
                  <li>• Use clear, descriptive titles for easy recognition</li>
                  <li>• Set the date to when you want to be reminded</li>
                  <li>• Choose yearly for birthdays and anniversaries</li>
                  <li>• Monthly reminders work great for recurring tasks</li>
                  <li>• Enable expiration for time-sensitive reminders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddReminderPage;
