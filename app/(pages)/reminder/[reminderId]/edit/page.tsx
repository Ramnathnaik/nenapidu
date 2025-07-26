"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { FREQUENCY_OPTIONS } from "@/app/types/reminder";
import Swal from "sweetalert2";

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateToRemember: string;
  completed: boolean;
  frequency: "NEVER" | "MONTH" | "YEAR";
  shouldExpire: boolean;
  profileId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const EditReminderPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const { reminderId } = useParams();

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateToRemember, setDateToRemember] = useState("");
  const [frequency, setFrequency] = useState("NEVER");
  const [shouldExpire, setShouldExpire] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Fetch reminder data
  useEffect(() => {
    const fetchReminder = async () => {
      if (!reminderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/reminders/single/${reminderId}`);
        if (response.ok) {
          const data = await response.json();
          setReminder(data);

          // Populate form fields
          setTitle(data.title);
          setDescription(data.description || "");
          setDateToRemember(data.dateToRemember);
          setFrequency(data.frequency);
          setShouldExpire(data.shouldExpire);
          setCompleted(data.completed);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch reminder", errorData);
          setError(true);
          Swal.fire({
            title: 'Error!',
            text: `Failed to load reminder: ${errorData.error || "Unknown error"}`,
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      } catch (error) {
        console.error("Failed to fetch reminder:", error);
        setError(true);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load reminder. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReminder();
  }, [reminderId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !dateToRemember) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Title and Date are required.',
        icon: 'warning',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (!reminder) {
      Swal.fire({
        title: 'Error',
        text: 'Reminder data not loaded.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Format dateToRemember to YYYY-MM-dd
    const formattedDate = new Date(dateToRemember).toISOString().slice(0, 10);

    setSubmitting(true);
    
    // Show loading alert
    Swal.fire({
      title: 'Updating Reminder...',
      text: 'Please wait while we update your reminder.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch("/api/reminders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reminder.id,
          title,
          description,
          dateToRemember: formattedDate,
          frequency,
          shouldExpire,
          completed,
          userId,
          profileId: reminder.profileId,
        }),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Updated!',
          text: 'Reminder updated successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        // Navigate back to profile page if there's a profileId, otherwise dashboard
        if (reminder.profileId) {
          router.push(`/profile/${reminder.profileId}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        const errorData = await response.json();
        await Swal.fire({
          title: 'Error!',
          text: `Failed to update reminder: ${errorData.error}`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
      await Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getBackLink = () => {
    if (reminder?.profileId) {
      return `/profile/${reminder.profileId}`;
    }
    return "/dashboard";
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Loading reminder...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !reminder) {
    return (
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Reminder Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The reminder you&#39;re trying to edit could not be loaded. It may
              have been deleted or you may not have permission to edit it.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gray-300 dark:bg-gray-800">
      <div className="flex items-center mb-6 md:mb-8">
        <Link href={getBackLink()}>
          <ArrowLeft className="w-6 h-6 mr-4 text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400" />
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
          Edit Reminder
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
              />
              <label
                htmlFor="shouldExpire-mobile"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Should Expire
              </label>
            </div>
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="completed-mobile"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 mr-2 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                disabled={submitting}
              />
              <label
                htmlFor="completed-mobile"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mark as Completed
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <Link
                href={getBackLink()}
                className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Updating..." : "Update Reminder"}
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
                        disabled={submitting}
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
                        disabled={submitting}
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
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        disabled={submitting}
                      >
                        {FREQUENCY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="shouldExpire"
                          checked={shouldExpire}
                          onChange={(e) => setShouldExpire(e.target.checked)}
                          className="w-5 h-5 mr-3 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          disabled={submitting}
                        />
                        <label
                          htmlFor="shouldExpire"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Should Expire
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="completed"
                          checked={completed}
                          onChange={(e) => setCompleted(e.target.checked)}
                          className="w-5 h-5 mr-3 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          disabled={submitting}
                        />
                        <label
                          htmlFor="completed"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Mark as Completed
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Link
                      href={getBackLink()}
                      className="px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 font-semibold text-white bg-violet-500 rounded-lg hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Updating..." : "Update Reminder"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar with Additional Info */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Reminder Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-gray-800 dark:text-white">
                      Created
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {new Date(reminder.dateToRemember).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-gray-800 dark:text-white">
                      Last Updated
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {new Date(reminder.dateToRemember).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditReminderPage;
