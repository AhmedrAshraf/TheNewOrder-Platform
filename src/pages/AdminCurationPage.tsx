import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileArchive,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Eye,
  ArrowUpDown,
  MessageCircle,
  Star,
  Tag,
  Calendar,
  Save,
  Bell,
  Edit,
  Shield,
  ChevronDown,
  SlidersHorizontal,
  FolderOpen,
  Folder,
  FileText,
  NotebookPen,
  Paperclip,
  Mic,
  AlertCircle,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { AdminNav } from "../components/AdminNav";
import type { Workflow, AuthState } from "../types";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import ReactPlayer from 'react-player';

// Sample workflows for demonstration
type Workflow = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  image: string;
  creator: string;
  submittedAt: string;
  price: number;
  category: string;
  tags: string[];
  reviewedAt?: string;
  reviewedBy?: string;
  curatorNotes?: string;
  rejectionReason?: string;
  rating?: number;
  comments?: number;
  key_features?: string[];
};

export function AdminCurationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [curatorNotes, setCuratorNotes] = useState<string>("");
  const [showNotesHistory, setShowNotesHistory] = useState<boolean>(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    const pendingSolution = async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching solutions:", error);
      } else {
        setWorkflows(data);
      }
    };
    pendingSolution();
  }, []);

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-card max-w-md text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-surface-900">
            Access Denied
          </h2>
          <p className="text-surface-600 mb-6">
            You don't have permission to access the admin panel.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg py-3 px-8 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesStatus =
      filterStatus === "all" || workflow?.status === filterStatus;

    const searchTerm = searchQuery.toLowerCase();
    const title = workflow?.title?.toLowerCase() || "";
    const description = workflow?.description?.toLowerCase() || "";
    const creator = workflow?.creator?.creator_name?.toLowerCase() || "";
    console.log("🚀 ~ AdminCurationPage ~ creator:", creator);

    const matchesSearch =
      title.includes(searchTerm) ||
      description.includes(searchTerm) ||
      creator.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const approveWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from("solutions")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          reviewed_by: user?.name || "admin",
          curator_notes: curatorNotes || null,
        })
        .eq("id", id);

      if (error) throw error;

      setWorkflows((prev) =>
        prev.map((workflow) =>
          workflow.id === id
            ? {
                ...workflow,
                status: "approved",
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.name || "admin",
                curatorNotes: curatorNotes || undefined,
              }
            : workflow
        )
      );
      addNotification({
        type: "creator",
        title: "Workflow Approved",
        message: `Your workflow "${selectedWorkflow?.title}" has been approved`,
        link: "/dashboard",
      });
      setSelectedWorkflow(null);
      setCuratorNotes("");
    } catch (error) {
      console.error("Error approving workflow:", error);
      addNotification({
        type: "error",
        title: "Approval Failed",
        message: "There was an error approving the workflow",
      });
    }
  };

  const rejectWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from("solutions")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.name || "admin",
          curator_notes: curatorNotes || null,
        })
        .eq("id", id);

      if (error) throw error;

      setWorkflows((prev) =>
        prev.map((workflow) =>
          workflow.id === id
            ? {
                ...workflow,
                status: "rejected",
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.name || "admin",
                rejectionReason,
                curatorNotes: curatorNotes || undefined,
              }
            : workflow
        )
      );
      addNotification({
        type: "creator",
        title: "Workflow Rejected",
        message: `Your workflow "${selectedWorkflow?.title}" has been rejected`,
        link: "/dashboard",
      });
      setRejectionReason("");
      setShowRejectionModal(false);
      setSelectedWorkflow(null);
      setCuratorNotes("");
    } catch (error) {
      console.error("Error approving workflow:", error);
      addNotification({
        type: "error",
        title: "Rejection Failed",
        message: "There was an error approving the workflow",
      });
    }
  };

  const openRejectionModal = () => {
    setShowRejectionModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-surface-200 text-surface-600 text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  // Sample curation history for demonstration
  const curationHistory = [
    {
      date: "2025-06-10T15:30:00Z",
      curator: "admin",
      action: "Added note",
      note: "Initial review: Looks promising but need to check for similar existing products.",
    },
    {
      date: "2025-06-10T16:45:00Z",
      curator: "content_reviewer",
      action: "Added note",
      note: "Content seems original. Pricing is appropriate for the feature set.",
    },
    {
      date: "2025-06-11T09:15:00Z",
      curator: "tech_reviewer",
      action: "Added note",
      note: "Technical implementation looks solid. API documentation is comprehensive.",
    },
  ];

  const downloadBlueprint = async (selectedWorkflow) => {
    console.log(selectedWorkflow);
    
    if (!selectedWorkflow?.bluePrint) {
      alert('No blueprint available for download');
      return;
    }
    try {
      const url = selectedWorkflow.bluePrint;
      const filename = url.split('/').pop() || 'blueprint';
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download blueprint');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-surface-900">
                Solution Curation
              </h1>
              <p className="text-surface-600">
                Review and manage solution submissions
              </p>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Admin Navigation */}
          <AdminNav />

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full md:w-64 space-y-4">
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" /> Filters
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === "all"
                        ? "bg-gradient-to-r from-primary-600 to-secondary-500 text-white"
                        : "hover:bg-surface-100"
                    }`}
                  >
                    All Submissions
                  </button>
                  <button
                    onClick={() => setFilterStatus("pending")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === "pending"
                        ? "bg-gradient-to-r from-primary-600 to-secondary-500 text-white"
                        : "hover:bg-surface-100"
                    }`}
                  >
                    Pending Review
                  </button>
                  <button
                    onClick={() => setFilterStatus("approved")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === "approved"
                        ? "bg-gradient-to-r from-primary-600 to-secondary-500 text-white"
                        : "hover:bg-surface-100"
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setFilterStatus("rejected")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === "rejected"
                        ? "bg-gradient-to-r from-primary-600 to-secondary-500 text-white"
                        : "hover:bg-surface-100"
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5" /> Search
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search submissions..."
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4">Curation Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-surface-600 text-sm">Pending Review</p>
                    <p className="text-2xl font-bold">
                      {workflows.filter((w) => w.status === "pending").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-surface-600 text-sm">Approved Today</p>
                    <p className="text-2xl font-bold">
                      {workflows.filter((w) => w.status === "approved").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-surface-600 text-sm">Rejected Today</p>
                    <p className="text-2xl font-bold">
                      {workflows.filter((w) => w.status === "rejected").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-surface-600 text-sm">Avg. Review Time</p>
                    <p className="text-2xl font-bold">1.2 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex-1 transition-all duration-300">
                {selectedWorkflow ? (
                  <div className="bg-white rounded-2xl p-8 border border-surface-100 shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-3xl font-bold font-poppins text-gradient bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                          {selectedWorkflow.title}
                        </h2>
                        <div className="mt-2">
                          {getStatusBadge(selectedWorkflow.status)}
                        </div>
                      </div>
                      <button
                        onClick={openRejectionModal}
                        className="p-2 hover:bg-surface-50 rounded-full transition-colors duration-200"
                        aria-label="Close workflow details"
                      >
                        <XCircle className="h-6 w-6 text-surface-400 hover:text-surface-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                      {/* Left Column - Media & Metadata */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="relative group overflow-hidden rounded-xl aspect-square">
                          <img
                            src={selectedWorkflow.image}
                            alt={selectedWorkflow.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white font-medium">
                              View Full Preview
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-surface-50 p-4 rounded-xl">
                            <div className="flex flex-wrap justify-between gap-5 items-center">
                              <div>
                                <p className="text-sm font-medium text-surface-500 mb-1">
                                  Submitted By
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary-600">
                                      {selectedWorkflow.creator.creator_name.charAt(
                                        0
                                      )}
                                    </span>
                                  </div>
                                  <p className="font-medium">
                                    {selectedWorkflow.creator.creator_name}
                                  </p>
                                </div>
                              </div>
                              {selectedWorkflow.creator?.creator_title && (
                                <div className="">
                                  <p className="text-sm font-medium text-surface-500 mb-1">
                                    Creator title
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {selectedWorkflow.creator?.creator_title}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {selectedWorkflow.creator?.creator_bio && (
                                <div className="w-full">
                                  <p className="text-sm font-medium text-surface-500 mb-1">
                                    Creator bio
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                      {selectedWorkflow.creator?.creator_bio}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                         {/* Key Features Section */}
                        {selectedWorkflow?.key_features && selectedWorkflow.key_features.length > 0 && (
                          <div className="bg-surface-50 p-3 rounded-xl w-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary-500" />
                              Key Features
                            </h3>
                            <div className="">
                              {selectedWorkflow.key_features.map((feature, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-surface-200 w-full">
                                  <span className="text-surface-700">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface-50 p-3 rounded-lg">
                              <p className="text-xs font-medium text-surface-500">
                                Submitted On
                              </p>
                              <p className="font-medium text-sm">
                                {new Date(
                                  selectedWorkflow.created_at
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>

                            <div className="bg-surface-50 p-3 rounded-lg">
                              <p className="text-xs font-medium text-surface-500">
                                Price
                              </p>
                              <p className="font-medium text-sm text-primary-600">
                                ${selectedWorkflow.price}
                              </p>
                            </div>
                            <div>
                              {/* <p className="text-surface-600 text-sm">Rating</p>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-surface-300'}`}
                                    fill={i < 4 ? 'currentColor' : 'none'}
                                  />
                                ))}
                                <span className="ml-2 text-sm">4.0</span>
                              </div> */}
                            </div>
                          </div>
                          {selectedWorkflow?.bluePrint && (
                            <div className="bg-blue-50/50 border border-blue-100 w-full p-4 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-sm text-blue-800 flex items-center gap-2">
                                  <FileArchive className="h-5 w-5" />
                                  Workflow Blueprint
                                </h4>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                  Download Available
                                </span>
                              </div>

                              <div onClick={() => downloadBlueprint(selectedWorkflow)} className="flex cursor-pointer items-center gap-4 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                  <FileArchive className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-surface-700 mb-1">
                                    {selectedWorkflow.bluePrint
                                      .split("/")
                                      .pop() || "blueprint.pdf"}
                                  </p>
                                  <p className="text-xs text-surface-500">
                                    Click to download the complete blueprint
                                  </p>
                                </div>
                                <button
                                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                  aria-label="Download blueprint"
                                >
                                  <Download className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedWorkflow?.demoVideo && (
                            <div className="bg-surface-50 rounded-xl overflow-hidden border border-surface-200">
                              <video className="w-full aspect-video bg-black" controls autoPlay={false} playsInline poster="/video-poster.jpg" >
                                <source src={selectedWorkflow.demoVideo} type="video/mp4"/>
                                Your browser does not support the video tag.
                              </video>

                              <div className="p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Demo Video  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>document .querySelector("video").requestFullscreen()}
                                      className="text-surface-500 hover:text-surface-700"
                                      aria-label="Fullscreen">
                                      <Folder className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Content */}
                      <div className="lg:col-span-3 space-y-8">
                        <div className="bg-surface-50 p-3 rounded-xl">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary-500" />
                            Description
                          </h3>
                          <p className="text-surface-600 leading-relaxed">
                            {selectedWorkflow.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-surface-50 p-3 rounded-xl">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Folder className="h-5 w-5 text-primary-500" />
                              Category
                            </h3>
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-100 text-primary-600 capitalize">
                              {selectedWorkflow.category}
                            </div>
                          </div>

                          <div className="bg-surface-50 p-3 rounded-xl">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Tag className="h-5 w-5 text-primary-500" />
                              Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedWorkflow.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-surface-100 text-surface-700 rounded-full text-xs font-medium hover:bg-surface-200 transition-colors"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-surface-50 p-6 rounded-xl w-full">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <LayoutDashboard className="h-5 w-5 text-primary-500" />
                            integrations
                          </h3>
                          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-100 text-primary-600 capitalize">
                            {selectedWorkflow.category}
                          </div>
                        </div>

                        {selectedWorkflow.status === "rejected" &&
                          selectedWorkflow.rejectionReason && (
                            <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
                              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                Rejection Reason
                              </h3>
                              <p className="text-red-600">
                                {selectedWorkflow.rejectionReason}
                              </p>
                            </div>
                          )}

                        <div className="bg-surface-50 p-6 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                              <NotebookPen className="h-5 w-5 text-primary-500" />
                              Curator Notes
                            </h3>
                            <button
                              onClick={() =>
                                setShowNotesHistory(!showNotesHistory)
                              }
                              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                            >
                              {showNotesHistory ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Hide History
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4" />
                                  View History
                                </>
                              )}
                            </button>
                          </div>

                          {showNotesHistory ? (
                            <div className="space-y-4">
                              {curationHistory.map((entry, index) => (
                                <div
                                  key={index}
                                  className="bg-white p-4 rounded-lg border border-surface-100 shadow-xs"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-surface-600">
                                          {entry.curator.charAt(0)}
                                        </span>
                                      </div>
                                      <span className="font-medium text-sm">
                                        {entry.curator}
                                      </span>
                                    </div>
                                    <span className="text-xs text-surface-400">
                                      {new Date(entry.date).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-surface-600 pl-8">
                                    {entry.note}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="relative">
                              <textarea
                                value={curatorNotes}
                                onChange={(e) =>
                                  setCuratorNotes(e.target.value)
                                }
                                className="w-full bg-white border border-surface-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-40 text-surface-700 placeholder-surface-400 resize-none transition-all"
                                placeholder="Add your detailed notes about this workflow..."
                              />
                              <div className="absolute bottom-3 right-3 flex gap-2">
                                <button className="p-1.5 rounded-full hover:bg-surface-100 transition-colors">
                                  <Paperclip className="h-4 w-4 text-surface-400" />
                                </button>
                                <button className="p-1.5 rounded-full hover:bg-surface-100 transition-colors">
                                  <Mic className="h-4 w-4 text-surface-400" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedWorkflow.status === "pending" && (
                          <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <button
                              onClick={() =>
                                approveWorkflow(selectedWorkflow.id)
                              }
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl py-4 px-6 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 font-medium"
                             >
                              <CheckCircle className="h-5 w-5" />
                              Approve Workflow
                            </button>
                            <button
                              onClick={openRejectionModal}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl py-4 px-6 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 font-medium"
                             >
                              <XCircle className="h-5 w-5" />
                              Request Changes
                            </button>
                          </div>
                        )}

                        {selectedWorkflow?.faq?.length > 0 && (
                          <div className="bg-surface-50 p-6 rounded-xl">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <HelpCircle className="h-5 w-5 text-primary-500" />
                              Frequently Asked Questions
                            </h3>

                            <div className="space-y-2">
                              {selectedWorkflow.faq.map((item, index) => (
                                <div
                                  key={index}
                                  className="bg-white rounded-lg border border-surface-100 overflow-hidden"
                                >
                                  <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full text-left p-4 hover:bg-surface-50 transition-colors flex justify-between items-center"
                                  >
                                    <h4 className="font-medium text-surface-800 pr-2">
                                      {item.question}
                                    </h4>
                                    <ChevronDown
                                      className={`h-5 w-5 text-surface-400 transition-transform duration-200 ${
                                        expandedFAQ === index
                                          ? "transform rotate-180"
                                          : ""
                                      }`}
                                    />
                                  </button>

                                  {expandedFAQ === index && (
                                    <div className="p-4 text-surface-600  border-t border-surface-100">
                                      {item.answer}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-surface-900">
                          {filterStatus === "all"
                            ? "All Submissions"
                            : filterStatus === "pending"
                            ? "Pending Review"
                            : filterStatus === "approved"
                            ? "Approved Workflows"
                            : "Rejected Workflows"}
                        </h2>
                        <p className="text-surface-500 text-sm">
                          {filteredWorkflows.length}{" "}
                          {filteredWorkflows.length === 1 ? "item" : "items"}{" "}
                          found
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <select
                            className="appearance-none bg-surface-50 border border-surface-200 rounded-xl pl-4 pr-8 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            defaultValue="newest"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-high">
                              Price: High to Low
                            </option>
                            <option value="price-low">
                              Price: Low to High
                            </option>
                          </select>
                          <ChevronDown className="h-4 w-4 text-surface-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                        <button className="p-2.5 hover:bg-surface-100 rounded-xl transition-colors">
                          <SlidersHorizontal className="h-5 w-5 text-surface-600" />
                        </button>
                      </div>
                    </div>

                    {filteredWorkflows.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center border border-surface-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mb-4">
                          <FolderOpen className="h-8 w-8 text-surface-400" />
                        </div>
                        <h3 className="text-lg font-medium text-surface-700 mb-2">
                          No submissions found
                        </h3>
                        <p className="text-surface-500 max-w-md">
                          {filterStatus === "pending"
                            ? "There are currently no workflows pending review."
                            : "Try adjusting your filters to see more results."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredWorkflows.map((workflow) => (
                          <div
                            key={workflow.id}
                            className="bg-white rounded-xl p-5 border border-surface-100 hover:border-primary-300 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md group overflow-hidden"
                            onClick={() => setSelectedWorkflow(workflow)}
                          >
                            <div className="relative py-1 aspect-video mb-4 rounded-lg overflow-hidden">
                              <img
                                src={workflow.image}
                                alt={workflow.title}
                                className="w-full h-4/5 object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute bottom-0 right-3">
                                {getStatusBadge(workflow.status)}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold line-clamp-2">
                                  {workflow.title}
                                </h3>
                                <span className="text-sm font-medium text-primary-600 whitespace-nowrap">
                                  ${workflow.price}
                                </span>
                              </div>

                              <p className="text-sm text-surface-600 line-clamp-2">
                                {workflow.description}
                              </p>

                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-surface-600">
                                      {workflow?.creator?.creator_name?.charAt(
                                        0
                                      ) || "U"}
                                    </span>
                                  </div>
                                  <span className="text-xs text-surface-500">
                                    {workflow?.creator?.creator_name ||
                                      "Unknown"}
                                  </span>
                                </div>

                                <span className="text-xs text-surface-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(
                                    workflow.created_at
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md relative border border-surface-200 shadow-xl">
            <button
              onClick={() => setShowRejectionModal(false)}
              className="absolute right-4 top-4 text-surface-400 hover:text-surface-600"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6">Reject Submission</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 h-32"
                  placeholder="Provide a reason for rejection..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg py-3 px-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    selectedWorkflow && rejectWorkflow(selectedWorkflow.id)
                  }
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
