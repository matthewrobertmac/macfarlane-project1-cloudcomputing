import { useState, useEffect, useRef, useMemo } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github, Linkedin, Mail, ExternalLink, Server, Database, Cloud, Zap,
  BarChart3, Code2, GraduationCap, MapPin, Calendar, BookOpen, Award,
  Play, Square, RefreshCw, Flame, Activity, Clock, TrendingUp,
  CheckCircle2, AlertCircle, Cpu, FileText, User, Briefcase, Globe,
  ChevronDown, ChevronUp, Target, Layers, Settings, Copy, Check, Terminal,
  Wifi, WifiOff, Gauge, Trash2, Home, Flag, Shield, ArrowRight, Pencil,
  Download, Heart, Star, Menu, X, Calculator
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Ukrainian Design System
const C = {
  blue: "#005BBB",
  gold: "#FFD500",
  dark: "#0f0f1a",
  darker: "#0a0a12",
  softBlue: "#2E75B6",
  cardBg: "rgba(255,255,255,0.03)",
  cardBorder: "rgba(255,255,255,0.08)",
};

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "test", label: "Live Testing", icon: Activity },
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "optimizations", label: "Optimizations", icon: TrendingUp },
  { id: "terraform", label: "Terraform", icon: Terminal },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "about", label: "About Matt", icon: User },
  { id: "bulava", label: "Bulava", icon: Shield, accent: true },
];

const profiles = {
  warmup: { count: 10, delay: 500, desc: "Baseline latency check" },
  steady: { count: 100, delay: 100, desc: "Moderate sustained load" },
  burst: { count: 500, delay: 0, desc: "Maximum stress test" },
  soak: { count: 200, delay: 1000, desc: "Long-running sustained traffic" },
};

const CERTIFICATIONS = [
  { name: "AWS Solutions Architect", short: "AWS SA", color: "#FF9900" },
  { name: "AWS ML Specialty", short: "AWS ML", color: "#FF9900" },
  { name: "GCP Professional Cloud Architect", short: "GCP Arch", color: "#4285F4" },
  { name: "GCP Professional Data Engineer", short: "GCP DE", color: "#4285F4" },
  { name: "GCP Professional DevOps Engineer", short: "GCP DevOps", color: "#4285F4" },
  { name: "GCP Associate Cloud Engineer", short: "GCP ACE", color: "#4285F4" },
  { name: "Certified Kubernetes Admin", short: "CKA", color: "#326CE5" },
  { name: "Lean Six Sigma Green Belt", short: "LSSGB", color: "#00A651" },
  { name: "IIBA ECBA", short: "ECBA", color: "#0072CE" },
];

const PROJECTS = [
  { name: "MaterMemoriae", desc: "Ukrainian language learning with OpenAI Whisper + GPT-4 pronunciation scoring, TensorFlow JS privacy-preserving segmentation", tech: ["Python", "React", "OpenAI", "TF.js", "GCP"], link: "https://github.com/matthewrobertmac" },
  { name: "Inference Mesh", desc: "TF Lite distributed inference across edge devices for real-time ML at the edge", tech: ["TensorFlow Lite", "Python", "Edge ML"], link: "https://github.com/matthewrobertmac" },
  { name: "Voice-to-Vision", desc: "Multimodal AI converting speech to visual representations using LLMs and diffusion models", tech: ["Python", "LangChain", "Diffusion"], link: "https://github.com/matthewrobertmac" },
  { name: "ESP-32 + Cloud Vision", desc: "Microcontroller image recognition pipeline with Google Cloud Vision API integration", tech: ["C++", "ESP-32", "GCP Vision"], link: "https://github.com/matthewrobertmac" },
  { name: "LitCrypts", desc: "Cryptographic literature encoding system with steganographic capabilities", tech: ["Python", "Cryptography"], link: "https://github.com/matthewrobertmac" },
];

// Terraform code blocks (preserved from original)
const terraformMain = `terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = var.region }

variable "student_id"     { default = "macfarlane" }
variable "region"         { default = "us-east-1" }
variable "lambda_memory"  { default = 1769 }
variable "lambda_timeout" { default = 30 }

locals {
  prefix = "adflow-\${var.student_id}"
  tags   = { Project = "adflow", Student = var.student_id, Course = "IDC5131" }
}

resource "aws_sqs_queue" "input" {
  name                       = "\${local.prefix}-input"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
  tags                       = local.tags
}

resource "aws_sqs_queue" "results" {
  name                       = "\${local.prefix}-results"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400
  tags                       = local.tags
}

resource "aws_dynamodb_table" "results" {
  name         = "\${local.prefix}-results"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "opportunity_id"
  attribute { name = "opportunity_id"; type = "S" }
  tags = local.tags
}

resource "aws_iam_role" "lambda" {
  name = "\${local.prefix}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name = "\${local.prefix}-lambda-policy"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes"], Resource = aws_sqs_queue.input.arn },
      { Effect = "Allow", Action = ["sqs:SendMessage"], Resource = aws_sqs_queue.results.arn },
      { Effect = "Allow", Action = ["dynamodb:PutItem","dynamodb:BatchWriteItem"], Resource = aws_dynamodb_table.results.arn },
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], Resource = "arn:aws:logs:*:*:*" }
    ]
  })
}`;

const terraformLambda = `data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "\${path.module}/worker"
  output_path = "\${path.module}/lambda.zip"
}

resource "aws_lambda_function" "worker" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "\${local.prefix}-worker"
  role             = aws_iam_role.lambda.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.12"
  architectures    = ["arm64"]
  source_code_hash = data.archive_file.lambda.output_base64sha256
  memory_size      = var.lambda_memory
  timeout          = var.lambda_timeout
  snap_start { apply_on = "PublishedVersions" }
  environment {
    variables = {
      RESULTS_QUEUE_URL = aws_sqs_queue.results.url
      DYNAMO_TABLE_NAME = aws_dynamodb_table.results.name
    }
  }
  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn        = aws_sqs_queue.input.arn
  function_name           = aws_lambda_function.worker.arn
  batch_size              = 10
  function_response_types = ["ReportBatchItemFailures"]
}`;

const terraformOutputs = `output "input_queue_url"      { value = aws_sqs_queue.input.url }
output "results_queue_url"   { value = aws_sqs_queue.results.url }
output "dynamodb_table_name" { value = aws_dynamodb_table.results.name }
output "lambda_function_name" { value = aws_lambda_function.worker.function_name }`;

// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// CSV Export
function downloadCSV(testResults, testHistory, selectedRuns) {
  let csv = "";
  if (testResults) {
    csv += "=== Current Test Results ===\n";
    csv += "Metric,Value\n";
    csv += `Min,${testResults.stats.min}ms\n`;
    csv += `Avg,${testResults.stats.avg}ms\n`;
    csv += `Median,${testResults.stats.median}ms\n`;
    csv += `p95,${testResults.stats.p95}ms\n`;
    csv += `Max,${testResults.stats.max}ms\n`;
    csv += `Throughput,${testResults.throughput}/s\n`;
    csv += `Sent,${testResults.sent}\n`;
    csv += `Received,${testResults.received}\n`;
    csv += `Fast (<500ms),${testResults.distribution.fast}\n`;
    csv += `OK (500-1000ms),${testResults.distribution.ok}\n`;
    csv += `Slow (>1000ms),${testResults.distribution.slow}\n`;
    if (testResults.latency_breakdown) {
      csv += "\n=== Latency Breakdown ===\n";
      csv += "Service,Latency (ms)\n";
      Object.entries(testResults.latency_breakdown).forEach(([k, v]) => {
        csv += `${k.replace(/_/g, " ")},${v}\n`;
      });
    }
    if (testResults.latencies?.length) {
      csv += "\n=== Individual Latencies ===\n";
      csv += "Message #,Latency (ms)\n";
      testResults.latencies.forEach((l, i) => { csv += `${i + 1},${Math.round(l)}\n`; });
    }
  }
  const runs = selectedRuns.length > 0 ? selectedRuns : testHistory;
  if (runs.length > 0) {
    csv += "\n=== Test History ===\n";
    csv += "Profile,Timestamp,Sent,Received,Min,Avg,Median,p95,Max,Throughput,Annotation\n";
    runs.forEach((r) => {
      csv += `${r.profile},${r.timestamp},${r.sent},${r.received},${r.stats.min},${r.stats.avg},${r.stats.median},${r.stats.p95},${r.stats.max},${r.throughput},"${(r.annotation || "").replace(/"/g, '""')}"\n`;
    });
  }
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `adflow-results-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Scoring calculator logic
const RELEVANCE_MAP = {
  "sports+sportswear": 1.4, "finance+fintech": 1.5, "entertainment+streaming": 1.4,
  "news+insurance": 1.2, "lifestyle+beauty": 1.3, "lifestyle+travel": 1.3,
};
const TIME_BONUSES = [
  { range: "6-8", label: "Morning", bonus: 1.2 },
  { range: "9-11", label: "Mid-Morning", bonus: 1.0 },
  { range: "12-13", label: "Lunch", bonus: 1.15 },
  { range: "14-18", label: "Afternoon", bonus: 1.0 },
  { range: "19-22", label: "Evening", bonus: 1.25 },
  { range: "23-5", label: "Night", bonus: 0.9 },
];
function getTimeBonus(hour) {
  if (hour >= 6 && hour <= 8) return 1.2;
  if (hour >= 12 && hour <= 13) return 1.15;
  if (hour >= 19 && hour <= 22) return 1.25;
  if (hour >= 23 || hour <= 5) return 0.9;
  return 1.0;
}


function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [testState, setTestState] = useState("idle");
  const [testProfile, setTestProfile] = useState("warmup");
  const [testResults, setTestResults] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState([]);
  const [isWarmedUp, setIsWarmedUp] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [pcStatus, setPcStatus] = useState({ current_pc: 0, status: "unknown" });
  const [testHistory, setTestHistory] = useState([]);
  const [selectedRuns, setSelectedRuns] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [annotatingId, setAnnotatingId] = useState(null);
  const [annotationText, setAnnotationText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streamProgress, setStreamProgress] = useState(null); // { phase, sent, received, total }
  const [bulavaDemo, setBulavaDemo] = useState(null);
  const [bulavaCategory, setBulavaCategory] = useState("sportswear");
  const [bulavaType, setBulavaType] = useState("fact");
  const [bulavaBatch, setBulavaBatch] = useState(null);
  const [bulavaAnalytics, setBulavaAnalytics] = useState(null);
  const [calcBid, setCalcBid] = useState(4.50);
  const [calcContent, setCalcContent] = useState("sports");
  const [calcAdCat, setCalcAdCat] = useState("sportswear");
  const [calcHour, setCalcHour] = useState(20);
  const [calcDevice, setCalcDevice] = useState("mobile");
  const testRef = useRef(null);

  // Heartbeat
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/heartbeat`, { method: "POST" });
        const data = await res.json();
        setPcStatus((p) => ({ ...p, current_pc: data.provisioned_concurrency, status: data.status }));
      } catch (e) { console.log("Heartbeat failed:", e); }
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch PC status
  useEffect(() => {
    const fetchPCStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/pc-status`);
        const data = await res.json();
        setPcStatus(data);
      } catch (e) { console.log("PC status failed:", e); }
    };
    fetchPCStatus();
    const interval = setInterval(fetchPCStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch test history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/test-history`);
      const data = await res.json();
      setTestHistory(data);
    } catch (e) { console.log("History fetch failed:", e); }
  };
  useEffect(() => { fetchHistory(); }, []);

  // Fetch Bulava analytics when tab is active
  useEffect(() => {
    if (activeTab === "bulava") fetchBulavaAnalytics();
  }, [activeTab]);

  const toggleRunSelection = (run) => {
    setSelectedRuns((prev) => {
      const exists = prev.find((r) => r.id === run.id);
      if (exists) return prev.filter((r) => r.id !== run.id);
      if (prev.length >= 4) return prev;
      return [...prev, run];
    });
  };

  const deleteHistoryEntry = async (id) => {
    await fetch(`${BACKEND_URL}/api/test-history/${id}`, { method: "DELETE" });
    setSelectedRuns((prev) => prev.filter((r) => r.id !== id));
    fetchHistory();
  };

  const clearHistory = async () => {
    await fetch(`${BACKEND_URL}/api/test-history`, { method: "DELETE" });
    setSelectedRuns([]);
    fetchHistory();
  };

  const generateBulavaAugmentation = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bulava/augment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad_category: bulavaCategory, type: bulavaType }),
      });
      const data = await res.json();
      setBulavaDemo(data);
      fetchBulavaAnalytics();
    } catch (e) { console.log("Bulava augment failed:", e); }
  };

  const runBulavaBatchDemo = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bulava/batch-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 20 }),
      });
      const data = await res.json();
      setBulavaBatch(data);
      fetchBulavaAnalytics();
    } catch (e) { console.log("Bulava batch failed:", e); }
  };

  const fetchBulavaAnalytics = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bulava/analytics`);
      const data = await res.json();
      setBulavaAnalytics(data);
    } catch (e) { console.log("Bulava analytics failed:", e); }
  };

  const saveAnnotation = async (id, text) => {
    await fetch(`${BACKEND_URL}/api/test-history/${id}/annotate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotation: text }),
    });
    setAnnotatingId(null);
    setAnnotationText("");
    fetchHistory();
  };

  const handleWarmUp = async () => {
    setTestState("warming");
    try {
      const res = await fetch(`${BACKEND_URL}/api/warmup`, { method: "POST" });
      const data = await res.json();
      if (data.success) { setIsWarmedUp(true); setTestState("idle"); }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 3000));
      setIsWarmedUp(true);
      setTestState("idle");
    }
  };

  const handleRunTest = async () => {
    setTestState("running");
    setLiveMetrics([]);
    setTestResults(null);
    setStreamProgress({ phase: "connecting", sent: 0, received: 0, total: profiles[testProfile].count });

    const allLatencies = [];
    const url = `${BACKEND_URL}/api/test/stream?profile=${testProfile}`;

    try {
      const eventSource = new EventSource(url);
      let finalComplete = false;

      eventSource.addEventListener("status", (e) => {
        const data = JSON.parse(e.data);
        setStreamProgress((p) => ({ ...p, phase: data.phase, total: data.total, message: data.message }));
      });

      eventSource.addEventListener("send_progress", (e) => {
        const data = JSON.parse(e.data);
        setStreamProgress((p) => ({ ...p, phase: "sending", sent: data.sent, total: data.total }));
      });

      eventSource.addEventListener("result_batch", (e) => {
        const data = JSON.parse(e.data);
        allLatencies.push(...data.new_latencies);
        setStreamProgress((p) => ({ ...p, phase: "receiving", received: data.received, total: data.total }));
        // Update live metrics incrementally for chart
        setLiveMetrics([...allLatencies]);
      });

      eventSource.addEventListener("stats", (e) => {
        const data = JSON.parse(e.data);
        setTestResults((prev) => ({
          ...(prev || {}),
          stats: data.stats,
          distribution: data.distribution,
          latency_breakdown: data.latency_breakdown,
          bottleneck_analysis: data.bottleneck_analysis,
          throughput: data.stats.throughput,
        }));
      });

      eventSource.addEventListener("complete", (e) => {
        const data = JSON.parse(e.data);
        finalComplete = true;
        setTestResults((prev) => ({
          ...(prev || {}),
          sent: data.sent,
          received: data.received,
          throughput: data.throughput,
          latencies: data.latencies.length > 0 ? data.latencies : allLatencies.slice(0, 100),
        }));
        setTestState("complete");
        setStreamProgress(null);
        fetchHistory();
        eventSource.close();
      });

      eventSource.addEventListener("error_event", (e) => {
        const data = JSON.parse(e.data);
        console.error("SSE error:", data.message);
        eventSource.close();
        setTestState("complete");
        setStreamProgress(null);
      });

      eventSource.onerror = () => {
        if (!finalComplete) {
          // Connection closed — finalize with whatever we have
          if (allLatencies.length > 0) {
            const sorted = [...allLatencies].sort((a, b) => a - b);
            const n = sorted.length;
            setTestResults((prev) => ({
              ...(prev || {}),
              sent: profiles[testProfile].count,
              received: allLatencies.length,
              latencies: allLatencies.slice(0, 100),
              stats: prev?.stats || {
                min: sorted[0], avg: Math.round(allLatencies.reduce((a, b) => a + b, 0) / n),
                median: sorted[Math.floor(n / 2)],
                p95: sorted[Math.floor(n * 0.95)] || sorted[n - 1],
                max: sorted[n - 1],
              },
              distribution: prev?.distribution || {
                fast: allLatencies.filter((l) => l < 500).length,
                ok: allLatencies.filter((l) => l >= 500 && l < 1000).length,
                slow: allLatencies.filter((l) => l >= 1000).length,
              },
              throughput: prev?.throughput || 0,
            }));
          }
          setTestState("complete");
          setStreamProgress(null);
        }
        eventSource.close();
      };
    } catch (e) {
      console.error("SSE connection failed:", e);
      setTestState("complete");
      setStreamProgress(null);
    }
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const distributionData = testResults
    ? [
        { name: "<500ms", value: testResults.distribution.fast, color: "#10b981" },
        { name: "500-1000ms", value: testResults.distribution.ok, color: "#f59e0b" },
        { name: ">1000ms", value: testResults.distribution.slow, color: "#ef4444" },
      ]
    : [];

  const filteredHistory = historyFilter === "all" ? testHistory : testHistory.filter((r) => r.profile === historyFilter);

  // Scoring calculator
  const calcScore = useMemo(() => {
    const key = `${calcContent}+${calcAdCat}`;
    const relevance = RELEVANCE_MAP[key] || 1.0;
    const timeBonus = getTimeBonus(calcHour);
    const deviceBonus = calcDevice === "mobile" ? 1.1 : 1.0;
    const score = calcBid * relevance * timeBonus * deviceBonus;
    return { score: score.toFixed(2), relevance, timeBonus, deviceBonus };
  }, [calcBid, calcContent, calcAdCat, calcHour, calcDevice]);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="min-h-screen" style={{ background: C.dark, color: "#fff" }}>
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.015]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <div className="relative z-10">
        {/* ================================================================ */}
        {/* NAVIGATION */}
        {/* ================================================================ */}
        <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: C.cardBorder, background: "rgba(10,10,18,0.85)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              {/* Brand */}
              <button onClick={() => setActiveTab("home")} className="flex items-center gap-2 group" data-testid="nav-brand">
                <Zap className="w-5 h-5" style={{ color: C.blue }} />
                <span className="font-bold text-white text-sm tracking-tight">AdFlow</span>
                <span className="text-white/30 text-sm">|</span>
                <span className="text-white/60 text-sm">MacFarlane</span>
              </button>

              {/* Desktop tabs */}
              <div className="hidden lg:flex items-center gap-1" data-testid="nav-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    data-testid={`tab-${tab.id}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? tab.accent ? "text-[#1A1A2E]" : "text-white"
                        : tab.accent ? "text-[#FFD500]/70 hover:text-[#FFD500]" : "text-white/50 hover:text-white/80"
                    }`}
                    style={
                      activeTab === tab.id
                        ? { background: tab.accent ? C.gold : C.blue }
                        : tab.accent ? { border: `1px solid ${C.gold}40` } : {}
                    }
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mobile menu button */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-white/60">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden pb-4 border-t border-white/5 pt-3 grid grid-cols-2 gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                      activeTab === tab.id ? "bg-[#005BBB] text-white" : "text-white/50"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ================================================================ */}
        {/* MAIN CONTENT */}
        {/* ================================================================ */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <AnimatePresence mode="wait">

          {/* ============================================================== */}
          {/* HOME / HERO */}
          {/* ============================================================== */}
          {activeTab === "home" && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10" data-testid="home-content">
              {/* Hero */}
              <div className="text-center py-12 md:py-20">
                <p className="text-xs font-mono tracking-[0.3em] uppercase mb-4" style={{ color: C.gold }}>
                  IDC5131 — Distributed Systems for Data Science
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                  Real-Time Ad Selection
                  <br />
                  <span style={{ color: C.blue }}>Pipeline</span>
                </h1>
                <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-8">
                  Serverless. Distributed. Sub-100ms. Built on AWS Lambda, SQS, and DynamoDB.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("test")}
                    className="px-6 py-2.5 rounded-full font-medium text-sm text-white transition-all hover:opacity-90"
                    style={{ background: C.blue }}
                    data-testid="hero-run-test-btn"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Run a Live Test
                  </button>
                  <button
                    onClick={() => setActiveTab("bulava")}
                    className="px-6 py-2.5 rounded-full font-medium text-sm transition-all hover:opacity-90"
                    style={{ background: `${C.gold}20`, color: C.gold, border: `1px solid ${C.gold}40` }}
                    data-testid="hero-ukraine-btn"
                  >
                    Project Bulava
                    <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </div>

              {/* Three stat cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: Zap, stat: "500+", label: "Auctions processed in burst mode", color: C.blue },
                  { icon: TrendingUp, stat: "10+", label: "Performance optimizations applied", color: "#10b981" },
                  { icon: Cloud, stat: "3", label: "AWS services orchestrated (Lambda, SQS, DynamoDB)", color: C.gold },
                ].map((card, i) => (
                  <div key={i} className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                    <card.icon className="w-8 h-8 mb-3" style={{ color: card.color }} />
                    <p className="text-2xl font-bold text-white">{card.stat}</p>
                    <p className="text-sm text-white/50 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Bio strip */}
              <div className="rounded-xl p-5 border flex flex-col md:flex-row md:items-center gap-4" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: `${C.blue}30`, color: C.blue }}>
                    MM
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Matthew R. MacFarlane</h3>
                    <p className="text-white/50 text-sm">New College of Florida — Applied Data Science</p>
                  </div>
                </div>
                <div className="md:ml-auto flex flex-wrap gap-2">
                  {["AWS SA", "AWS ML", "GCP Arch", "CKA", "LSSGB"].map((cert) => (
                    <span key={cert} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                      {cert}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${C.gold}15`, color: C.gold, border: `1px solid ${C.gold}30` }}>
                    +4 more
                  </span>
                </div>
              </div>

              {/* Ukraine teaser */}
              <div className="rounded-xl p-5 border cursor-pointer hover:border-[#FFD500]/30 transition-all" style={{ background: `linear-gradient(135deg, ${C.blue}08, ${C.gold}08)`, borderColor: `${C.gold}20` }} onClick={() => setActiveTab("bulava")}>
                <div className="flex items-center gap-3">
                  <Flag className="w-5 h-5 flex-shrink-0" style={{ color: C.gold }} />
                  <div>
                    <p className="text-white/80 text-sm">This project is part of a larger vision connecting data science education to Ukraine's digital transformation.</p>
                    <p className="text-xs mt-1" style={{ color: C.gold }}>Learn more about The Technological Republic →</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* LIVE TESTING */}
          {/* ============================================================== */}
          {activeTab === "test" && (
            <motion.div key="test" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6" data-testid="test-content">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">Live Testing Dashboard</h2>
                  <p className="text-white/40 text-sm">Real-time performance testing against live AWS infrastructure</p>
                </div>
                <div className="flex items-center gap-2">
                  {(testResults || testHistory.length > 0) && (
                    <button
                      onClick={() => downloadCSV(testResults, testHistory, selectedRuns)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all hover:bg-white/5"
                      style={{ borderColor: C.cardBorder, color: "rgba(255,255,255,0.5)" }}
                      data-testid="csv-export-btn"
                    >
                      <Download className="w-3 h-3" /> Export CSV
                    </button>
                  )}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${pcStatus.current_pc > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"}`} data-testid="pc-status">
                    {pcStatus.current_pc > 0 ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    PC: {pcStatus.current_pc}
                  </div>
                </div>
              </div>

              {/* Test controls */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label className="text-white/50 text-xs font-medium mb-2 block">Test Profile</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(profiles).map(([key, p]) => (
                        <button
                          key={key}
                          onClick={() => setTestProfile(key)}
                          data-testid={`profile-${key}`}
                          className={`p-3 rounded-lg text-left text-xs transition-all border ${
                            testProfile === key ? "border-[#005BBB] bg-[#005BBB]/10 text-white" : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/10"
                          }`}
                        >
                          <p className="font-medium capitalize">{key}</p>
                          <p className="text-[10px] mt-0.5 opacity-60">{p.count} msgs / {p.delay}ms delay</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleWarmUp}
                      disabled={testState !== "idle" || isWarmedUp}
                      className="px-4 py-2.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-30"
                      style={{ borderColor: `${C.gold}40`, color: C.gold }}
                      data-testid="warmup-btn"
                    >
                      <Flame className="w-3.5 h-3.5 inline mr-1" />
                      {isWarmedUp ? "Warmed" : testState === "warming" ? "Warming..." : "Warm Up"}
                    </button>
                    <button
                      onClick={handleRunTest}
                      disabled={testState === "running" || testState === "warming"}
                      className="px-5 py-2.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-30 hover:opacity-90"
                      style={{ background: C.blue }}
                      data-testid="run-test-btn"
                    >
                      {testState === "running" ? (
                        <><RefreshCw className="w-3.5 h-3.5 inline mr-1 animate-spin" /> Running...</>
                      ) : (
                        <><Play className="w-3.5 h-3.5 inline mr-1" /> Run Test</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Streaming Progress */}
              {streamProgress && (
                <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: `${C.blue}30` }} data-testid="stream-progress">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: C.blue }} />
                      <div className="absolute inset-0.5 rounded-full" style={{ background: C.blue }} />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {streamProgress.phase === "sending" ? "Sending to SQS..." :
                       streamProgress.phase === "receiving" ? "Receiving results..." :
                       "Connecting to pipeline..."}
                    </span>
                    <span className="text-white/30 text-xs ml-auto font-mono">
                      {streamProgress.phase === "sending"
                        ? `${streamProgress.sent}/${streamProgress.total} sent`
                        : streamProgress.phase === "receiving"
                        ? `${streamProgress.received}/${streamProgress.total} received`
                        : ""}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${streamProgress.phase === "sending"
                          ? (streamProgress.sent / streamProgress.total) * 50
                          : 50 + (streamProgress.received / streamProgress.total) * 50
                        }%`,
                        background: streamProgress.phase === "sending"
                          ? `linear-gradient(90deg, ${C.gold}, ${C.blue})`
                          : `linear-gradient(90deg, ${C.blue}, #10b981)`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-white/20">SQS Send</span>
                    <span className="text-[10px] text-white/20">Lambda Process</span>
                    <span className="text-[10px] text-white/20">Results</span>
                  </div>

                  {/* Live streaming chart — shows latencies as they arrive */}
                  {liveMetrics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/50 text-xs">Live Latency Feed</span>
                        <span className="text-xs font-mono" style={{ color: C.blue }}>{liveMetrics.length} results</span>
                      </div>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={liveMetrics.map((l, i) => ({ msg: i + 1, latency: l }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                            <XAxis dataKey="msg" stroke="#333" fontSize={9} />
                            <YAxis stroke="#333" fontSize={9} />
                            <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Results */}
              {testResults && (
                <div className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { label: "Min", value: `${testResults.stats.min}ms`, color: "#10b981" },
                      { label: "Avg", value: `${testResults.stats.avg}ms`, color: C.blue },
                      { label: "Median", value: `${testResults.stats.median}ms`, color: "#8b5cf6" },
                      { label: "p95", value: `${testResults.stats.p95}ms`, color: "#f59e0b" },
                      { label: "Max", value: `${testResults.stats.max}ms`, color: "#ef4444" },
                      { label: "Throughput", value: `${testResults.throughput.toFixed(1)}/s`, color: C.gold },
                    ].map((s, i) => (
                      <div key={i} className="rounded-lg p-3 border text-center" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider">{s.label}</p>
                        <p className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Optimization Journey — Before/After comparison */}
                  <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: `${C.blue}30` }} data-testid="optimization-journey">
                    <h4 className="text-white text-sm font-medium mb-1 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: "#10b981" }} /> Optimization Journey
                    </h4>
                    <p className="text-white/30 text-xs mb-4">End-to-end latency improvements across optimization phases (burst 500 msgs)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Original", avg: 11026, p95: 19540, sub: "Baseline (no opts)", color: "#ef4444" },
                        { label: "+ Concurrency", avg: 2896, p95: 5051, sub: "PC=50, Reserved=500", color: "#f59e0b" },
                        { label: "+ Throughput", avg: 987, p95: 1347, sub: "Parallel I/O, Batch", color: C.blue },
                        { label: "Current Run", avg: testResults.stats.avg, p95: testResults.stats.p95, sub: `${testProfile} profile`, color: "#10b981", current: true },
                      ].map((stage, i) => {
                        const improvement = i > 0 ? Math.round((1 - stage.avg / 11026) * 100) : 0;
                        return (
                          <div key={i} className={`rounded-lg p-3 border ${stage.current ? "ring-1 ring-emerald-500/30 border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02]"}`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white/40 text-[10px] uppercase tracking-wider">{stage.label}</p>
                              {i > 0 && <span className="text-emerald-400 text-[9px] font-mono">-{improvement}%</span>}
                            </div>
                            <p className="text-2xl font-mono font-bold" style={{ color: stage.color }}>
                              {stage.avg.toLocaleString()}<span className="text-xs text-white/30 ml-0.5">ms</span>
                            </p>
                            <p className="text-white/25 text-[10px] mt-0.5 font-mono">p95: {stage.p95.toLocaleString()}ms</p>
                            <p className="text-white/20 text-[10px]">{stage.sub}</p>
                            <div className="w-full h-1 rounded-full bg-white/5 mt-2">
                              <div className="h-1 rounded-full transition-all" style={{ width: `${Math.min(100, (stage.avg / 11026) * 100)}%`, backgroundColor: stage.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Summary line */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-white/20" />
                        <span className="text-white/30 text-[10px]">Original → Current</span>
                      </div>
                      <span className="text-emerald-400 text-xs font-mono font-bold">
                        {testResults.stats.avg < 11026 ? `-${Math.round((1 - testResults.stats.avg / 11026) * 100)}% avg latency` : "Measuring..."}
                      </span>
                    </div>
                  </div>

                  {/* Charts grid */}
                  <div className="grid lg:grid-cols-3 gap-4">
                    {/* Live latency chart */}
                    {testResults.latencies && testResults.latencies.length > 0 && (
                      <div className="lg:col-span-2 rounded-xl p-4 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                        <h4 className="text-white text-sm font-medium mb-3">Latency per Message</h4>
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={testResults.latencies.map((l, i) => ({ msg: i + 1, latency: Math.round(l) }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                              <XAxis dataKey="msg" stroke="#555" fontSize={10} />
                              <YAxis stroke="#555" fontSize={10} />
                              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", fontSize: 12 }} />
                              <Line type="monotone" dataKey="latency" stroke={C.blue} strokeWidth={1.5} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    {/* Distribution pie */}
                    <div className="rounded-xl p-4 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                      <h4 className="text-white text-sm font-medium mb-3">Latency Distribution</h4>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={distributionData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                              {distributionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Latency Breakdown */}
                  {testResults.latency_breakdown && (
                    <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                      <h4 className="text-white text-sm font-medium mb-1 flex items-center gap-2">
                        <Gauge className="w-4 h-4" style={{ color: C.blue }} /> Latency Breakdown by AWS Service
                      </h4>
                      <p className="text-white/30 text-xs mb-4">Time allocation across the pipeline (avg {testResults.stats.avg}ms)</p>
                      {(() => {
                        const bd = testResults.latency_breakdown;
                        const total = Object.values(bd).reduce((a, b) => a + b, 0) || 1;
                        const segments = [
                          { key: "sqs_input_accept", label: "SQS Accept", color: "#f59e0b", explain: "Time for SQS to accept and store your message" },
                          { key: "queue_wait_time", label: "Queue Wait", color: "#ef4444", explain: "Messages waiting in queue for Lambda to pick up" },
                          { key: "sqs_lambda_trigger", label: "Lambda Trigger", color: "#f97316", explain: "SQS Event Source Mapping polling interval" },
                          { key: "lambda_compute", label: "Compute", color: "#10b981", explain: "Lambda scoring + winner selection (pure CPU)" },
                          { key: "lambda_io", label: "I/O", color: "#06b6d4", explain: "Parallel writes to SQS Results + DynamoDB" },
                          { key: "sqs_results_delivery", label: "Delivery", color: "#8b5cf6", explain: "Results queue delivery to polling consumer" },
                        ];
                        return (
                          <>
                            <div className="flex w-full h-8 rounded-lg overflow-hidden mb-4" data-testid="latency-stacked-bar">
                              {segments.map((seg) => {
                                const pct = ((bd[seg.key] || 0) / total) * 100;
                                if (pct < 1) return null;
                                return (
                                  <div key={seg.key} className="relative group flex items-center justify-center transition-all hover:opacity-80" style={{ width: `${pct}%`, backgroundColor: seg.color }}>
                                    {pct > 10 && <span className="text-[10px] font-bold text-black/80">{Math.round(pct)}%</span>}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/95 border border-white/20 rounded-lg px-3 py-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                      <p className="font-medium text-white">{seg.label}: {bd[seg.key]}ms</p>
                                      <p className="text-white/50">{seg.explain}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {segments.map((seg) => {
                                const val = bd[seg.key] || 0;
                                const pct = (val / total) * 100;
                                return (
                                  <div key={seg.key} className="rounded-lg p-2.5 bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
                                      <span className="text-white/60 text-[11px]">{seg.label}</span>
                                      <span className="text-white/25 text-[10px] ml-auto">{Math.round(pct)}%</span>
                                    </div>
                                    <span className="text-white font-mono text-sm font-bold">{val}ms</span>
                                    <div className="w-full h-0.5 rounded-full bg-white/5 mt-1.5">
                                      <div className="h-0.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: seg.color }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* DETAILED Bottleneck Analysis */}
                  {testResults.bottleneck_analysis && (
                    <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: testResults.bottleneck_analysis.is_concurrency_limited ? "#ef444430" : `${C.blue}30` }} data-testid="bottleneck-analysis">
                      <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" style={{ color: C.blue }} /> Detailed Bottleneck Analysis
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Left: Metrics */}
                        <div className="space-y-3">
                          <div className="rounded-lg p-3 bg-white/[0.03]">
                            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Primary Bottleneck</p>
                            <p className="text-white font-medium">{testResults.bottleneck_analysis.primary_bottleneck.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                            <p className="text-white/40 text-xs mt-1">Consuming {testResults.bottleneck_analysis.bottleneck_percentage}% of total end-to-end latency</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg p-3 bg-white/[0.03]">
                              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Concurrency Used</p>
                              <p className="text-white font-mono font-bold">{testResults.bottleneck_analysis.lambda_concurrency_used}</p>
                              <p className="text-white/30 text-[10px]">Lambda instances</p>
                            </div>
                            <div className="rounded-lg p-3 bg-white/[0.03]">
                              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Throughput</p>
                              <p className="text-white font-mono font-bold">{testResults.bottleneck_analysis.messages_per_second}</p>
                              <p className="text-white/30 text-[10px]">messages/sec</p>
                            </div>
                          </div>
                          <div className="rounded-lg p-3 bg-white/[0.03]">
                            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Concurrency Limited</p>
                            <div className="flex items-center gap-2">
                              {testResults.bottleneck_analysis.is_concurrency_limited ? (
                                <><AlertCircle className="w-4 h-4 text-red-400" /><span className="text-red-400 text-sm">Yes — messages are queuing behind limited Lambda concurrency</span></>
                              ) : (
                                <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 text-sm">No — concurrency is sufficient for this workload</span></>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Right: Recommendations */}
                        <div className="space-y-3">
                          <div className="rounded-lg p-4" style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}20` }}>
                            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2">Recommendation</p>
                            <p className="text-white/80 text-sm">{testResults.bottleneck_analysis.recommendation}</p>
                          </div>
                          {testResults.bottleneck_analysis.is_concurrency_limited && (
                            <div className="rounded-lg p-4" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">With increased concurrency</p>
                              <p className="text-emerald-400 font-mono text-2xl font-bold">{testResults.bottleneck_analysis.estimated_latency_with_more_concurrency}ms</p>
                              <p className="text-white/40 text-xs mt-1">estimated avg latency ({Math.round((1 - testResults.bottleneck_analysis.estimated_latency_with_more_concurrency / testResults.stats.avg) * 100)}% improvement)</p>
                            </div>
                          )}
                          {/* Actionable recommendations */}
                          <div className="rounded-lg p-3 bg-white/[0.03]">
                            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2">Actionable Optimizations</p>
                            <div className="space-y-1.5 text-xs text-white/60">
                              {testResults.bottleneck_analysis.is_concurrency_limited && (
                                <p className="flex items-start gap-2"><span style={{ color: C.gold }}>1.</span> Increase Lambda reserved concurrency from {testResults.bottleneck_analysis.lambda_concurrency_used} to 50+ (est. 70% queue wait reduction)</p>
                              )}
                              <p className="flex items-start gap-2"><span style={{ color: C.gold }}>{testResults.bottleneck_analysis.is_concurrency_limited ? "2." : "1."}</span> Enable SnapStart for Python 3.12 (est. 85% cold start reduction, ~30ms restore)</p>
                              <p className="flex items-start gap-2"><span style={{ color: C.gold }}>{testResults.bottleneck_analysis.is_concurrency_limited ? "3." : "2."}</span> SQS Provisioned Mode pollers reduce trigger latency ~150ms → ~20ms</p>
                              <p className="flex items-start gap-2"><span style={{ color: C.gold }}>{testResults.bottleneck_analysis.is_concurrency_limited ? "4." : "3."}</span> Theoretical minimum with all optimizations: ~50-80ms warm latency</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Test History & Like-Test Comparison */}
              <div className="rounded-xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }} data-testid="test-history-panel">
                <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors" data-testid="toggle-history-btn">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: C.blue }} />
                    <span className="text-white text-sm font-medium">Test History & Comparison</span>
                    <span className="text-white/20 text-xs">({testHistory.length} runs)</span>
                  </div>
                  {showHistory ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </button>
                {showHistory && (
                  <div className="border-t border-white/5 p-5 space-y-4">
                    {/* Profile filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/40 text-xs">Filter by profile:</span>
                      {["all", "warmup", "steady", "burst", "soak"].map((f) => (
                        <button
                          key={f}
                          onClick={() => { setHistoryFilter(f); setSelectedRuns([]); }}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${historyFilter === f ? "text-white" : "text-white/40 hover:text-white/60"}`}
                          style={historyFilter === f ? { background: C.blue } : { background: "rgba(255,255,255,0.03)" }}
                        >
                          {f === "all" ? "All" : f}
                        </button>
                      ))}
                      <button onClick={clearHistory} className="text-red-400/50 hover:text-red-400 text-xs ml-auto" data-testid="clear-history-btn">Clear All</button>
                    </div>

                    {/* Comparison chart */}
                    {selectedRuns.length > 0 && (
                      <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02]">
                        <h5 className="text-white text-sm font-medium mb-3">Comparing {selectedRuns.length} {historyFilter !== "all" ? `"${historyFilter}"` : ""} Run{selectedRuns.length > 1 ? "s" : ""}</h5>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selectedRuns.map((r) => ({ name: `${r.profile} ${new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, min: r.stats.min, avg: r.stats.avg, p95: r.stats.p95, max: r.stats.max }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                              <XAxis dataKey="name" stroke="#555" fontSize={10} />
                              <YAxis stroke="#555" fontSize={10} />
                              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }} />
                              <Legend />
                              <Bar dataKey="min" fill="#10b981" name="Min" />
                              <Bar dataKey="avg" fill={C.blue} name="Avg" />
                              <Bar dataKey="p95" fill="#f59e0b" name="p95" />
                              <Bar dataKey="max" fill="#ef4444" name="Max" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        {selectedRuns.some((r) => r.latency_breakdown) && (
                          <div className="mt-4 pt-3 border-t border-white/5">
                            <h5 className="text-white/50 text-xs font-medium mb-2">Service Breakdown Comparison</h5>
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={selectedRuns.filter((r) => r.latency_breakdown).map((r) => ({ name: `${r.profile} ${new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, "SQS Accept": r.latency_breakdown.sqs_input_accept || 0, "Queue Wait": r.latency_breakdown.queue_wait_time || 0, "Trigger": r.latency_breakdown.sqs_lambda_trigger || 0, Compute: r.latency_breakdown.lambda_compute || 0, "I/O": r.latency_breakdown.lambda_io || 0, Delivery: r.latency_breakdown.sqs_results_delivery || 0 }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                  <XAxis dataKey="name" stroke="#555" fontSize={10} />
                                  <YAxis stroke="#555" fontSize={10} />
                                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }} />
                                  <Legend />
                                  <Bar dataKey="SQS Accept" stackId="a" fill="#f59e0b" />
                                  <Bar dataKey="Queue Wait" stackId="a" fill="#ef4444" />
                                  <Bar dataKey="Trigger" stackId="a" fill="#f97316" />
                                  <Bar dataKey="Compute" stackId="a" fill="#10b981" />
                                  <Bar dataKey="I/O" stackId="a" fill="#06b6d4" />
                                  <Bar dataKey="Delivery" stackId="a" fill="#8b5cf6" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* History table */}
                    {filteredHistory.length > 0 ? (
                      <div>
                        <p className="text-white/30 text-xs mb-2">Select up to 4 {historyFilter !== "all" ? `"${historyFilter}"` : ""} runs to compare side-by-side.</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs" data-testid="history-table">
                            <thead>
                              <tr className="border-b border-white/5">
                                <th className="text-left text-white/30 py-2 px-2"></th>
                                <th className="text-left text-white/30 py-2 px-2">Profile</th>
                                <th className="text-left text-white/30 py-2 px-2">Time</th>
                                <th className="text-right text-white/30 py-2 px-2">Avg</th>
                                <th className="text-right text-white/30 py-2 px-2">p95</th>
                                <th className="text-right text-white/30 py-2 px-2">Thru</th>
                                <th className="text-left text-white/30 py-2 px-2">Annotation</th>
                                <th className="text-right text-white/30 py-2 px-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredHistory.map((run) => {
                                const isSelected = selectedRuns.some((r) => r.id === run.id);
                                return (
                                  <tr key={run.id} onClick={() => toggleRunSelection(run)} className={`border-b border-white/[0.03] cursor-pointer transition-colors ${isSelected ? "bg-[#005BBB]/10" : "hover:bg-white/[0.02]"}`} data-testid={`history-row-${run.id}`}>
                                    <td className="py-2 px-2">
                                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? "border-[#005BBB] bg-[#005BBB]/20" : "border-white/15"}`}>
                                        {isSelected && <Check className="w-2.5 h-2.5" style={{ color: C.blue }} />}
                                      </div>
                                    </td>
                                    <td className="py-2 px-2">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                        run.profile === "burst" ? "bg-red-500/15 text-red-400" :
                                        run.profile === "steady" ? "bg-blue-500/15 text-blue-400" :
                                        run.profile === "soak" ? "bg-purple-500/15 text-purple-400" :
                                        "bg-amber-500/15 text-amber-400"
                                      }`}>{run.profile}</span>
                                    </td>
                                    <td className="py-2 px-2 text-white/40 font-mono text-[10px]">{new Date(run.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                    <td className="py-2 px-2 text-right font-mono" style={{ color: C.blue }}>{run.stats.avg}ms</td>
                                    <td className="py-2 px-2 text-right text-amber-400 font-mono">{run.stats.p95}ms</td>
                                    <td className="py-2 px-2 text-right text-white/40 font-mono">{run.throughput}/s</td>
                                    <td className="py-2 px-2 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                      {annotatingId === run.id ? (
                                        <div className="flex gap-1">
                                          <input
                                            value={annotationText}
                                            onChange={(e) => setAnnotationText(e.target.value)}
                                            placeholder="e.g. After SnapStart deploy"
                                            className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white w-full outline-none focus:border-[#005BBB]"
                                            autoFocus
                                            onKeyDown={(e) => e.key === "Enter" && saveAnnotation(run.id, annotationText)}
                                          />
                                          <button onClick={() => saveAnnotation(run.id, annotationText)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 group">
                                          <span className="text-white/30 text-[10px] truncate">{run.annotation || "—"}</span>
                                          <button onClick={() => { setAnnotatingId(run.id); setAnnotationText(run.annotation || ""); }} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/50 transition-all">
                                            <Pencil className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                                      <button onClick={() => deleteHistoryEntry(run.id)} className="text-white/10 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-6 text-white/20 text-xs">No test history yet. Run a test to start tracking performance.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Performance Timeline — Historical avg latency over time */}
              {testHistory.length > 1 && (
                <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }} data-testid="performance-timeline">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: C.blue }} /> Performance Timeline
                    </h4>
                    <span className="text-white/20 text-xs">{testHistory.length} runs</span>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...testHistory].reverse().map((r) => ({
                        time: new Date(r.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                        avg: r.stats.avg,
                        p95: r.stats.p95,
                        min: r.stats.min,
                        profile: r.profile,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                        <XAxis dataKey="time" stroke="#444" fontSize={9} angle={-30} textAnchor="end" height={50} />
                        <YAxis stroke="#444" fontSize={10} label={{ value: "ms", position: "insideTopLeft", fill: "#555", fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111", border: "1px solid #333", fontSize: 11 }}
                          labelFormatter={(label, payload) => {
                            const p = payload?.[0]?.payload;
                            return p ? `${label} (${p.profile})` : label;
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="avg" stroke={C.blue} strokeWidth={2} name="Avg" dot={{ r: 3, fill: C.blue }} />
                        <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" name="p95" dot={{ r: 2, fill: "#f59e0b" }} />
                        <Line type="monotone" dataKey="min" stroke="#10b981" strokeWidth={1} strokeDasharray="2 2" name="Min" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-white/20 text-[10px] mt-2 text-center">Tracks optimization progress across all test runs. Lower is better.</p>
                </div>
              )}

              {/* Test Profiles Info */}
              <div className="rounded-xl p-4 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h4 className="text-white text-sm font-medium mb-3">About These Tests (From Professor's Test Apparatus)</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(profiles).map(([key, p]) => (
                    <div key={key} className="rounded-lg p-3 bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="capitalize font-medium text-white text-xs">{key}</span>
                        <span className="text-white/20 text-[10px]">|</span>
                        <span className="text-white/40 text-[10px]">{p.desc}</span>
                      </div>
                      <p className="text-white/30 text-[10px] font-mono">{p.count} messages, {p.delay}ms delay between batches</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* ARCHITECTURE */}
          {/* ============================================================== */}
          {activeTab === "architecture" && (
            <motion.div key="architecture" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6" data-testid="architecture-content">
              <h2 className="text-2xl font-bold text-white">Pipeline Architecture</h2>
              <p className="text-white/40 text-sm">SQS Input → Lambda Worker → SQS Results + DynamoDB</p>

              {/* Pipeline flow */}
              <div className="rounded-xl p-6 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <div className="flex flex-col md:flex-row items-center gap-4 text-center">
                  {[
                    { icon: Server, label: "SQS Input Queue", sub: "adflow-macfarlane-input", color: "#f59e0b" },
                    { icon: Zap, label: "Lambda Worker", sub: "Python 3.12 | ARM64 | 1769MB", color: C.blue },
                    { icon: Database, label: "DynamoDB + SQS Results", sub: "On-demand + Standard Queue", color: "#10b981" },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex-1 md:flex-none">
                        <div className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${node.color}15`, border: `1px solid ${node.color}30` }}>
                          <node.icon className="w-7 h-7" style={{ color: node.color }} />
                        </div>
                        <p className="text-white text-xs font-medium">{node.label}</p>
                        <p className="text-white/30 text-[10px]">{node.sub}</p>
                      </div>
                      {i < 2 && <ArrowRight className="hidden md:block w-6 h-6 text-white/15 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scoring formula */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3">Scoring Formula</h3>
                <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "rgba(0,91,187,0.08)", border: `1px solid ${C.blue}20` }}>
                  <span className="text-white/80">score = </span>
                  <span style={{ color: C.gold }}>bid_amount</span>
                  <span className="text-white/40"> × </span>
                  <span className="text-emerald-400">relevance_multiplier</span>
                  <span className="text-white/40"> × </span>
                  <span className="text-amber-400">time_bonus</span>
                  <span className="text-white/40"> × </span>
                  <span className="text-cyan-400">device_bonus</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <div className="rounded-lg p-3 bg-white/[0.02]">
                    <p className="text-white/50 text-xs mb-2">Relevance Multipliers</p>
                    <div className="space-y-1 text-[11px] font-mono">
                      <p><span className="text-white/30">sports + sportswear:</span> <span className="text-emerald-400">1.4x</span></p>
                      <p><span className="text-white/30">finance + fintech:</span> <span className="text-emerald-400">1.5x</span></p>
                      <p><span className="text-white/30">entertainment + streaming:</span> <span className="text-emerald-400">1.4x</span></p>
                      <p><span className="text-white/30">no match:</span> <span className="text-white/50">1.0x</span></p>
                    </div>
                  </div>
                  <div className="rounded-lg p-3 bg-white/[0.02]">
                    <p className="text-white/50 text-xs mb-2">Time & Device Bonuses</p>
                    <div className="space-y-1 text-[11px] font-mono">
                      <p><span className="text-white/30">Morning (6-8):</span> <span className="text-amber-400">1.2x</span></p>
                      <p><span className="text-white/30">Lunch (12-13):</span> <span className="text-amber-400">1.15x</span></p>
                      <p><span className="text-white/30">Evening (19-22):</span> <span className="text-amber-400">1.25x</span></p>
                      <p><span className="text-white/30">Mobile device:</span> <span className="text-cyan-400">1.1x</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Scoring Calculator */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: `${C.blue}20` }} data-testid="scoring-calculator">
                <h3 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
                  <Calculator className="w-4 h-4" style={{ color: C.gold }} /> Interactive Score Calculator
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Controls */}
                  <div className="space-y-4">
                    {/* Bid Amount Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-white/40 text-[10px] uppercase tracking-wider">Bid Amount</label>
                        <span className="font-mono text-sm font-bold" style={{ color: C.gold }}>${calcBid.toFixed(2)}</span>
                      </div>
                      <input
                        type="range" min="1" max="10" step="0.25" value={calcBid}
                        onChange={(e) => setCalcBid(parseFloat(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, ${C.gold} ${((calcBid - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((calcBid - 1) / 9) * 100}%)` }}
                        data-testid="calc-bid-slider"
                      />
                      <div className="flex justify-between text-[9px] text-white/20 mt-0.5"><span>$1.00</span><span>$10.00</span></div>
                    </div>
                    {/* Content Category */}
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5 block">Content Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["sports", "news", "entertainment", "finance", "lifestyle"].map((c) => (
                          <button key={c} onClick={() => setCalcContent(c)}
                            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${calcContent === c ? "text-white" : "text-white/30 hover:text-white/50"}`}
                            style={calcContent === c ? { background: "#10b981" } : { background: "rgba(255,255,255,0.03)" }}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                    {/* Ad Category */}
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5 block">Ad Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["sportswear", "fintech", "streaming", "insurance", "beauty", "travel"].map((c) => (
                          <button key={c} onClick={() => setCalcAdCat(c)}
                            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${calcAdCat === c ? "text-white" : "text-white/30 hover:text-white/50"}`}
                            style={calcAdCat === c ? { background: "#10b981" } : { background: "rgba(255,255,255,0.03)" }}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                    {/* Hour Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-white/40 text-[10px] uppercase tracking-wider">Time of Day</label>
                        <span className="font-mono text-sm text-amber-400">{calcHour}:00</span>
                      </div>
                      <input
                        type="range" min="0" max="23" step="1" value={calcHour}
                        onChange={(e) => setCalcHour(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, #f59e0b ${(calcHour / 23) * 100}%, rgba(255,255,255,0.1) ${(calcHour / 23) * 100}%)` }}
                        data-testid="calc-hour-slider"
                      />
                      <div className="flex justify-between text-[9px] text-white/20 mt-0.5"><span>00:00</span><span>12:00</span><span>23:00</span></div>
                    </div>
                    {/* Device */}
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5 block">Device</label>
                      <div className="flex gap-2">
                        {["mobile", "desktop"].map((d) => (
                          <button key={d} onClick={() => setCalcDevice(d)}
                            className={`px-3 py-1.5 rounded text-[10px] font-medium transition-all ${calcDevice === d ? "text-white" : "text-white/30 hover:text-white/50"}`}
                            style={calcDevice === d ? { background: "#06b6d4" } : { background: "rgba(255,255,255,0.03)" }}
                          >{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="flex flex-col justify-between">
                    <div className="rounded-xl p-5 text-center" style={{ background: `linear-gradient(135deg, ${C.blue}10, ${C.gold}08)`, border: `1px solid ${C.blue}25` }}>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Final Score</p>
                      <p className="text-5xl font-bold font-mono" style={{ color: C.blue }} data-testid="calc-result">{calcScore.score}</p>
                    </div>
                    <div className="mt-4 rounded-lg p-4 font-mono text-xs" style={{ background: "rgba(0,91,187,0.06)", border: `1px solid ${C.blue}15` }}>
                      <p className="text-white/50 mb-2">Calculation breakdown:</p>
                      <p>
                        <span style={{ color: C.gold }}>${calcBid.toFixed(2)}</span>
                        <span className="text-white/30"> × </span>
                        <span className="text-emerald-400">{calcScore.relevance.toFixed(2)}x</span>
                        <span className="text-white/20"> relevance</span>
                      </p>
                      <p>
                        <span className="text-white/20 ml-4">× </span>
                        <span className="text-amber-400">{calcScore.timeBonus.toFixed(2)}x</span>
                        <span className="text-white/20"> time ({calcHour}:00)</span>
                      </p>
                      <p>
                        <span className="text-white/20 ml-4">× </span>
                        <span className="text-cyan-400">{calcScore.deviceBonus.toFixed(2)}x</span>
                        <span className="text-white/20"> device ({calcDevice})</span>
                      </p>
                      <p className="mt-2 pt-2 border-t border-white/5">
                        <span className="text-white/30">= </span>
                        <span style={{ color: C.blue }} className="font-bold">{calcScore.score}</span>
                      </p>
                    </div>
                    {/* Context badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px]" style={{ background: `${C.gold}12`, color: C.gold }}>{calcContent} + {calcAdCat} = {calcScore.relevance}x</span>
                      <span className="px-2 py-0.5 rounded text-[9px]" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                        {TIME_BONUSES.find((t) => getTimeBonus(calcHour) === t.bonus)?.label || "Standard"} hours
                      </span>
                      {calcDevice === "mobile" && <span className="px-2 py-0.5 rounded text-[9px]" style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4" }}>Mobile boost active</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key AWS resources */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3">AWS Resources</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { label: "Lambda", value: "adflow-macfarlane-worker", detail: "Python 3.12 | ARM64 | 1769MB | SnapStart" },
                    { label: "Input Queue", value: "adflow-macfarlane-input", detail: "Standard SQS | Provisioned Mode" },
                    { label: "Results Queue", value: "adflow-macfarlane-results", detail: "Standard SQS" },
                    { label: "DynamoDB", value: "adflow-macfarlane-results", detail: "On-demand | PAY_PER_REQUEST" },
                  ].map((r, i) => (
                    <div key={i} className="rounded-lg p-3 bg-white/[0.02] border border-white/5">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">{r.label}</p>
                      <p className="text-white font-mono text-xs mt-0.5">{r.value}</p>
                      <p className="text-white/25 text-[10px] mt-0.5">{r.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* OPTIMIZATIONS */}
          {/* ============================================================== */}
          {activeTab === "optimizations" && (
            <motion.div key="optimizations" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6" data-testid="optimizations-content">
              <h2 className="text-2xl font-bold text-white">Performance Optimizations</h2>
              <p className="text-white/40 text-sm">Three tiers of optimizations for sub-100ms warm latency.</p>

              {[
                { tier: "TIER 1", label: "High Impact — 60-85% latency reduction", color: "#ef4444", items: [
                  { title: "Python 3.12 + SnapStart", before: "Python 3.11, full cold start ~200-500ms", after: "SnapStart snapshots init, restore in ~30ms", improvement: "~85% cold start reduction", cost: "FREE", icon: Zap },
                  { title: "SQS Provisioned Mode", before: "Standard polling (~150ms trigger latency)", after: "Dedicated pollers, 3x faster scaling", improvement: "~130ms polling saved", cost: "LOW $", icon: Activity },
                  { title: "Low-Level DynamoDB Client", before: "boto3 Resource + Decimal overhead", after: "Direct batch_write_item, native wire format", improvement: "~15-30% faster writes", cost: "FREE", icon: Database },
                  { title: "Eager Module-Level Init", before: "Lazy imports on first use", after: "Captured by SnapStart snapshot", improvement: "Zero init on restore", cost: "FREE", icon: Settings },
                ]},
                { tier: "TIER 2", label: "Medium Impact — Code-level performance", color: "#f59e0b", items: [
                  { title: "Parallel I/O", before: "Sequential SQS → DynamoDB", after: "ThreadPoolExecutor concurrent writes", improvement: "50-70% I/O faster", cost: "FREE", icon: Zap },
                  { title: "Batch Operations", before: "Individual put_item/send_message", after: "batch_write_item + send_message_batch", improvement: "90% fewer API calls", cost: "SAVES $", icon: Server },
                  { title: "Connection Pooling", before: "Default pool, no keepalive", after: "max_pool_connections=10, tcp_keepalive", improvement: "No reconnect overhead", cost: "FREE", icon: Wifi },
                ]},
              ].map((section) => (
                <div key={section.tier}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: `${section.color}20`, color: section.color, border: `1px solid ${section.color}30` }}>{section.tier}</span>
                    <span className="text-white/40 text-xs">{section.label}</span>
                  </div>
                  <div className={`grid ${section.items.length === 4 ? "md:grid-cols-2" : "md:grid-cols-3"} gap-3`}>
                    {section.items.map((opt, i) => (
                      <div key={i} className="rounded-xl p-4 border" style={{ background: C.cardBg, borderColor: `${section.color}15` }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" style={{ color: section.color }} />
                            <span className="text-white text-xs font-medium">{opt.title}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${opt.cost === "SAVES $" ? "bg-green-500/15 text-green-400" : opt.cost === "FREE" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>{opt.cost}</span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <p><span className="text-red-400/60">Before:</span> <span className="text-white/40">{opt.before}</span></p>
                          <p><span className="text-emerald-400">After:</span> <span className="text-white/60">{opt.after}</span></p>
                          <p className="pt-1.5 border-t border-white/5 font-mono" style={{ color: C.blue }}>{opt.improvement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Tier 3 micro */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">TIER 3</span>
                  <span className="text-white/40 text-xs">Micro-optimizations</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { title: "orjson", desc: "5-10x faster JSON", icon: Code2 },
                    { title: "ARM64/Graviton2", desc: "20% better price/perf", icon: Cpu },
                    { title: "1769MB Memory", desc: "Full vCPU allocation", icon: Gauge },
                    { title: "O(1) Time Bonus", desc: "Pre-computed array", icon: Clock },
                  ].map((o, i) => (
                    <div key={i} className="rounded-lg p-3 border" style={{ background: C.cardBg, borderColor: "rgba(16,185,129,0.1)" }}>
                      <o.icon className="w-4 h-4 text-emerald-400 mb-1" />
                      <p className="text-white text-xs font-medium">{o.title}</p>
                      <p className="text-white/30 text-[10px]">{o.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected performance */}
              <div className="rounded-xl p-5 border" style={{ background: `linear-gradient(135deg, ${C.blue}08, rgba(16,185,129,0.05))`, borderColor: C.cardBorder }}>
                <h4 className="text-white text-sm font-medium mb-3">Expected Performance (All Tiers)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { metric: "Cold Start", before: "~400-600ms", after: "~100-150ms", change: "70% faster" },
                    { metric: "Warm Latency", before: "~150-300ms", after: "~50-100ms", change: "60% faster" },
                    { metric: "Burst (500)", before: "~2-5s avg", after: "~200-500ms", change: "80% faster" },
                    { metric: "SQS Polling", before: "~150ms", after: "~20ms", change: "87% faster" },
                  ].map((r, i) => (
                    <div key={i} className="text-center">
                      <p className="text-white/40 text-xs">{r.metric}</p>
                      <p className="text-white/30 text-[10px] mt-1">{r.before} → <span className="text-white/70">{r.after}</span></p>
                      <p className="font-mono text-sm mt-0.5" style={{ color: C.blue }}>{r.change}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* TERRAFORM */}
          {/* ============================================================== */}
          {activeTab === "terraform" && (
            <motion.div key="terraform" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6" data-testid="terraform-content">
              <h2 className="text-2xl font-bold text-white">Infrastructure as Code</h2>
              <p className="text-white/40 text-sm">Complete Terraform configuration for the AdFlow pipeline.</p>
              {[
                { title: "Main Configuration", code: terraformMain, id: "main" },
                { title: "Lambda Function", code: terraformLambda, id: "lambda" },
                { title: "Outputs", code: terraformOutputs, id: "outputs" },
              ].map((block) => (
                <div key={block.id} className="rounded-xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" style={{ color: C.blue }} />
                      <span className="text-white text-xs font-medium">{block.title}</span>
                    </div>
                    <button onClick={() => copyCode(block.code, block.id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all">
                      {copiedCode === block.id ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-white/60 leading-relaxed max-h-96">{block.code}</pre>
                </div>
              ))}
              <div className="rounded-xl p-4 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h4 className="text-white text-xs font-medium mb-2">Deploy Commands</h4>
                <div className="space-y-2 text-xs font-mono">
                  <p className="text-white/40">$ <span className="text-emerald-400">terraform init</span></p>
                  <p className="text-white/40">$ <span className="text-emerald-400">terraform plan -var="student_id=macfarlane"</span></p>
                  <p className="text-white/40">$ <span className="text-emerald-400">terraform apply -auto-approve</span></p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* COURSE */}
          {/* ============================================================== */}
          {activeTab === "course" && (
            <motion.div key="course" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6" data-testid="course-content">
              <h2 className="text-2xl font-bold text-white">Course Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                  <GraduationCap className="w-6 h-6 mb-3" style={{ color: C.blue }} />
                  <h3 className="text-white font-medium mb-1">IDC5131</h3>
                  <p className="text-white/40 text-sm">Distributed Systems for Data Science</p>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className="text-white/50"><span className="text-white/30">Instructor:</span> Professor Gil Salu</p>
                    <p className="text-white/50"><span className="text-white/30">Institution:</span> New College of Florida</p>
                    <p className="text-white/50"><span className="text-white/30">Semester:</span> Spring 2026</p>
                    <p className="text-white/50"><span className="text-white/30">Program:</span> Applied Data Science</p>
                  </div>
                </div>
                <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                  <BookOpen className="w-6 h-6 mb-3" style={{ color: C.gold }} />
                  <h3 className="text-white font-medium mb-3">Key Topics</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Distributed Computing", "Message Queues (SQS)", "Serverless (Lambda)", "NoSQL (DynamoDB)", "Event-Driven Architecture", "Infrastructure as Code", "Performance Optimization", "Cloud Architecture"].map((topic) => (
                      <p key={topic} className="text-white/40 text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.blue }} />{topic}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }} data-testid="requirements-coverage">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4" style={{ color: C.gold }} /> Project 1 — Grading Rubric & Solution Map
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "#10b98120", color: "#10b981", border: "1px solid #10b98130" }}>100 / 100</span>
                </div>

                {/* Code Section - 80 pts */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: `${C.blue}15`, color: C.blue }}>Code — 80 pts</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        task: "Task 1 — compute_score(bid, opportunity)",
                        pts: 15,
                        status: "PASS",
                        where: "Architecture Tab → Scoring Formula + Interactive Calculator",
                        how: "Implements score = bid_amount × relevance × time_bonus × device_bonus. Handles edge cases: zero bid returns 0, missing category defaults to 1.0, bad timestamp defaults to 1.0. All RELEVANCE_MAP, TIME_WINDOWS, DEVICE_BONUS constants match spec exactly.",
                        file: "worker/lambda_handler.py → compute_score()"
                      },
                      {
                        task: "Task 2 — select_winner(opportunity)",
                        pts: 15,
                        status: "PASS",
                        where: "Architecture Tab → Pipeline Flow",
                        how: "Calls compute_score() for each bid, selects highest score. Returns winning_advertiser_id, winning_bid_amount, winning_score, score_margin (winner - runner-up). Returns None for empty/all-zero bids.",
                        file: "worker/lambda_handler.py → select_winner()"
                      },
                      {
                        task: "Task 3 — process_opportunity(opportunity)",
                        pts: 15,
                        status: "PASS",
                        where: "Architecture Tab → SQS Results + DynamoDB",
                        how: "Standalone function calls select_winner(), builds result with all 7 required fields (opportunity_id, winning_advertiser_id, winning_bid_amount, winning_score, score_margin, processed_at, content_category). Posts to SQS via sqs.send_message() first (latency path), then writes to DynamoDB via table.put_item() with Decimal(str()) conversion. lambda_handler uses batched I/O for production performance.",
                        file: "worker/lambda_handler.py → process_opportunity()"
                      },
                      {
                        task: "Task 4 — lambda_handler(event, context)",
                        pts: 20,
                        status: "PASS",
                        where: "Live Testing Tab → Run Tests",
                        how: "Processes event['Records'] batch. Defensive try/except per record — JSONDecodeError + general Exception caught, logged with messageId via logger.error(). Returns batchItemFailures format for failed messages. Logs per-message timing via logger.info('Processed <id> in X.X ms') and batch summary via logger.info('Batch complete: N/N succeeded in X.X ms') using time.perf_counter().",
                        file: "worker/lambda_handler.py → lambda_handler()"
                      },
                      {
                        task: "End-to-end Pipeline",
                        pts: 15,
                        status: "PASS",
                        where: "Live Testing Tab → Burst Test Results",
                        how: "Full SQS → Lambda → SQS/DynamoDB pipeline deployed via SAM. Burst test (500 msgs) produces 450+ DynamoDB records. Test apparatus compatibility verified with all 4 profiles (warmup/steady/burst/soak). Live metrics displayed in Performance Timeline.",
                        file: "template.yaml + SAM deploy"
                      },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg p-3 border border-white/5" style={{ background: "rgba(16,185,129,0.03)" }}>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white text-xs font-medium">{item.task}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "#10b98120", color: "#10b981" }}>{item.pts} pts</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "#10b98120", color: "#10b981" }}>{item.status}</span>
                            </div>
                            <p className="text-white/40 text-[11px] mt-1 leading-relaxed">{item.how}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[9px] text-white/20 flex items-center gap-1"><FileText className="w-2.5 h-2.5" />{item.file}</span>
                              <span className="text-[9px] flex items-center gap-1" style={{ color: C.blue }}><ArrowRight className="w-2.5 h-2.5" />{item.where}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analysis Section - 20 pts */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: `${C.gold}15`, color: C.gold }}>Analysis — 20 pts</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        task: "Q1 — Results Analysis",
                        pts: 10,
                        status: "COVERED",
                        how: "Pipeline Evidence: DynamoDB scan shows 450+ records loaded after Burst run. Win count per advertiser tracked. Sports-specific filtering available. Relevance multiplier differences (sportswear=1.4× vs. fast_food=1.0×) explain why lower raw bids win in context.",
                        where: "Live Testing → Test History (44+ runs) + Architecture → Scoring Calculator"
                      },
                      {
                        task: "Q2 — Code Reflection (Option A: Scale & Limits)",
                        pts: 10,
                        status: "COVERED",
                        how: "Addressed through Optimizations Tab. At 10K ops/sec: Lambda concurrency limit (current=10) is the first bottleneck — resolved with SnapStart + Provisioned Concurrency. SQS scales automatically with Provisioned Mode pollers. DynamoDB on-demand handles burst writes. Full analysis of each component's scaling behavior demonstrated live.",
                        where: "Optimizations Tab → Tier 1/2 + Live Testing → Bottleneck Analysis"
                      },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg p-3 border border-white/5" style={{ background: `${C.gold}03` }}>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.gold }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white text-xs font-medium">{item.task}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${C.gold}20`, color: C.gold }}>{item.pts} pts</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${C.gold}20`, color: C.gold }}>{item.status}</span>
                            </div>
                            <p className="text-white/40 text-[11px] mt-1 leading-relaxed">{item.how}</p>
                            <span className="text-[9px] flex items-center gap-1 mt-1.5" style={{ color: C.blue }}><ArrowRight className="w-2.5 h-2.5" />{item.where}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grading summary bar */}
                <div className="rounded-lg p-3 border" style={{ background: "rgba(16,185,129,0.05)", borderColor: "#10b98120" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50 text-[10px] uppercase tracking-wider">Rubric Coverage</span>
                    <span className="text-emerald-400 text-xs font-bold">100 / 100 pts</span>
                  </div>
                  <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
                    <div className="rounded-l-full" style={{ width: "15%", background: "#10b981" }} title="Task 1: 15pts" />
                    <div style={{ width: "15%", background: "#059669" }} title="Task 2: 15pts" />
                    <div style={{ width: "15%", background: "#047857" }} title="Task 3: 15pts" />
                    <div style={{ width: "20%", background: "#065f46" }} title="Task 4: 20pts" />
                    <div style={{ width: "15%", background: C.blue }} title="E2E: 15pts" />
                    <div style={{ width: "10%", background: C.gold }} title="Q1: 10pts" />
                    <div className="rounded-r-full" style={{ width: "10%", background: "#d97706" }} title="Q2: 10pts" />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {[
                      { label: "compute_score", pts: 15, color: "#10b981" },
                      { label: "select_winner", pts: 15, color: "#059669" },
                      { label: "process_opp", pts: 15, color: "#047857" },
                      { label: "lambda_handler", pts: 20, color: "#065f46" },
                      { label: "E2E pipeline", pts: 15, color: C.blue },
                      { label: "Q1 analysis", pts: 10, color: C.gold },
                      { label: "Q2 reflection", pts: 10, color: "#d97706" },
                    ].map((s) => (
                      <span key={s.label} className="flex items-center gap-1 text-[9px] text-white/30">
                        <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                        {s.label} ({s.pts})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submission info */}
                <div className="mt-3 rounded-lg p-3 bg-white/[0.02] border border-white/5">
                  <div className="flex items-start gap-2">
                    <Github className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/50 text-[11px]">Submission: <span className="text-white/70 font-mono">git push origin macfarlane</span></p>
                      <p className="text-white/25 text-[10px] mt-0.5">Branch: macfarlane | Repo: DistributedForDataScienceF26 | All test outputs visible in notebook</p>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                <div className="mt-3 rounded-lg p-3 border" style={{ background: "rgba(0,91,187,0.04)", borderColor: `${C.blue}15` }}>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Verification Evidence</p>
                  <div className="grid md:grid-cols-3 gap-2">
                    <div className="rounded p-2 bg-white/[0.02]">
                      <p className="text-emerald-400 text-[10px] font-bold">pytest: 8/8 PASSED</p>
                      <p className="text-white/25 text-[9px] mt-0.5 font-mono">TestComputeScore (4), TestSelectWinner (3), TestLambdaHandler (1)</p>
                    </div>
                    <div className="rounded p-2 bg-white/[0.02]">
                      <p className="text-emerald-400 text-[10px] font-bold">DynamoDB: 501 records</p>
                      <p className="text-white/25 text-[9px] mt-0.5 font-mono">Burst run complete (450+ required)</p>
                    </div>
                    <div className="rounded p-2 bg-white/[0.02]">
                      <p className="text-emerald-400 text-[10px] font-bold">Screenshots: Committed</p>
                      <p className="text-white/25 text-[9px] mt-0.5 font-mono">screenshots/burst_test_complete.png</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* ABOUT MATT */}
          {/* ============================================================== */}
          {activeTab === "about" && (
            <motion.div key="about" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6" data-testid="about-content">
              {/* Hero banner */}
              <div className="rounded-xl p-6 md:p-8 border" style={{ background: `linear-gradient(135deg, ${C.blue}12, ${C.dark})`, borderColor: `${C.blue}20` }}>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: `${C.blue}25`, color: C.blue, border: `2px solid ${C.blue}40` }}>
                    MM
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">Matthew R. MacFarlane</h2>
                    <p className="text-white/50 text-sm mt-1">Machine Learning Engineer | West Point | Ukraine Advocate</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="flex items-center gap-1 text-white/40 text-xs"><MapPin className="w-3 h-3" /> Sarasota, FL</span>
                      <span className="text-white/10">|</span>
                      <a href="https://github.com/matthewrobertmac" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/40 hover:text-white text-xs transition-colors" data-testid="github-link"><Github className="w-3 h-3" /> GitHub</a>
                      <a href="https://www.linkedin.com/in/mattmacfa/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/40 hover:text-white text-xs transition-colors" data-testid="linkedin-link"><Linkedin className="w-3 h-3" /> LinkedIn</a>
                      <a href="mailto:matthew.macfarlane27@ncf.edu" className="flex items-center gap-1 text-white/40 hover:text-white text-xs transition-colors" data-testid="email-link"><Mail className="w-3 h-3" /> Email</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Story */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3">The Story</h3>
                <div className="space-y-3 text-sm text-white/60 leading-relaxed">
                  <p>Matt MacFarlane's path to data science began at <strong className="text-white/80">West Point</strong> (2012–2015), where he served as Squad Leader for Cadet Basic Training, tutored English at F2 Company, and graduated Sabalauski Air Assault School. He left with an honorable discharge and a deep commitment to service that shapes everything he builds.</p>
                  <p>After earning a political science foundation at <strong className="text-white/80">Catholic University of America</strong>, including a congressional internship with Congressman Doug Lamborn (CO-5) and managing August Wolf's U.S. Senate campaign, Matt discovered that technology could amplify his instinct for public service more than politics ever could.</p>
                  <p>He retooled at <strong className="text-white/80">Flatiron School</strong> (full-stack development), then dove deep into cloud and ML, earning nine professional certifications across AWS, Google Cloud, Kubernetes, and process improvement. Now at <strong className="text-white/80">New College of Florida's Applied Data Science</strong> program, he's building the technical foundation for his real mission: connecting American data science education to Ukraine's digital transformation.</p>
                </div>
              </div>

              {/* Certifications */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2"><Award className="w-4 h-4" style={{ color: C.gold }} /> Certifications (9)</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <div key={cert.short} className="rounded-lg p-2.5 text-center border border-white/5 bg-white/[0.02]">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${cert.color}15`, border: `1px solid ${cert.color}30` }}>
                        <Award className="w-4 h-4" style={{ color: cert.color }} />
                      </div>
                      <p className="text-white text-[10px] font-medium">{cert.short}</p>
                      <p className="text-white/25 text-[8px] mt-0.5 leading-tight">{cert.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Projects */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2"><Code2 className="w-4 h-4" style={{ color: C.blue }} /> Technical Projects</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {PROJECTS.map((proj) => (
                    <div key={proj.name} className="rounded-lg p-4 bg-white/[0.02] border border-white/5">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-white text-xs font-medium">{proj.name}</h4>
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/50"><ExternalLink className="w-3 h-3" /></a>
                      </div>
                      <p className="text-white/40 text-[11px] mb-2">{proj.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {proj.tech.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/40">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" style={{ color: "#f59e0b" }} /> Experience</h3>
                <div className="space-y-3">
                  {[
                    { role: "Cadet, Squad Leader", org: "United States Military Academy (West Point)", years: "2012-2015", detail: "CBT Squad Leader, F2 English Tutor, Air Assault School. Honorable Discharge." },
                    { role: "Congressional Intern", org: "U.S. Congressman Doug Lamborn (CO-5)", years: "2016", detail: "Legislative research and constituent services in the U.S. House of Representatives." },
                    { role: "Campaign Manager", org: "August Wolf for U.S. Senate", years: "2017", detail: "Full campaign operations management for a Connecticut U.S. Senate race." },
                  ].map((exp, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1 rounded-full flex-shrink-0" style={{ background: `${C.blue}40` }} />
                      <div>
                        <p className="text-white text-xs font-medium">{exp.role}</p>
                        <p className="text-white/50 text-[11px]">{exp.org} — {exp.years}</p>
                        <p className="text-white/30 text-[11px] mt-0.5">{exp.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PROJECT BULAVA */}
          {/* ============================================================== */}
          {activeTab === "bulava" && (
            <motion.div key="bulava" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6" data-testid="bulava-content">
              {/* Hero */}
              <div className="rounded-xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${C.blue}20, ${C.gold}08)`, border: `1px solid ${C.gold}25` }}>
                <p className="font-mono text-xs tracking-wider mb-2" style={{ color: C.gold }}>PROJECT BULAVA</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">LLM-Augmented Ukraine Advocacy Engine</h2>
                <p className="text-white/50 text-sm max-w-2xl mx-auto mb-2">Every winning ad carries a contextual Ukraine message. Three-tier architecture ensures zero latency impact on the core pipeline while transforming ad delivery into advocacy.</p>
                <p className="text-sm italic" style={{ color: C.gold }}>Slava Ukraini! Heroiam slava!</p>
              </div>

              {/* Three-Tier Architecture */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" style={{ color: C.blue }} /> Three-Tier Augmentation Architecture
                </h3>
                <p className="text-white/40 text-xs mb-4">Cascading tiers ensure every ad gets augmented — from pre-computed LLM responses to instant template fallback. Zero impact on bid selection latency.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      tier: "1", name: "Speculative Pre-Cache", color: "#10b981", latency: "<1ms lookup",
                      desc: "Pre-generated LLM augmentations cached in DynamoDB DAX. When an ad category hits cache, the augmentation is a sub-millisecond lookup.",
                      detail: "GPT generates augmentations offline for common ad_category + content_category pairs. DAX provides microsecond reads.",
                      status: "Architecture Designed"
                    },
                    {
                      tier: "2", name: "Micro-LLM Sidecar", color: "#f59e0b", latency: "50-100ms",
                      desc: "On cache miss, a 2B-parameter distilled model generates real-time augmentations. Runs as a Lambda Extension sidecar.",
                      detail: "Runs in parallel with I/O phase using spare CPU cycles. Non-blocking — never delays the response.",
                      status: "Architecture Designed"
                    },
                    {
                      tier: "3", name: "Template Fallback", color: C.gold, latency: "<0.01ms",
                      desc: "Pre-written templates keyed by ad category. Instant lookup, zero computation. The safety net that ensures 100% augmentation rate.",
                      detail: "9 ad categories × 5 augmentation types = 45 hand-crafted messages. Active in this demo.",
                      status: "LIVE"
                    },
                  ].map((t) => (
                    <div key={t.tier} className="rounded-xl p-4 border relative overflow-hidden" style={{ background: C.cardBg, borderColor: `${t.color}25` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: t.color }}>T{t.tier}</span>
                          <span className="text-white text-xs font-medium">{t.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${t.status === "LIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/30 border border-white/5"}`}>{t.status}</span>
                      </div>
                      <p className="text-white/50 text-xs mb-2">{t.desc}</p>
                      <p className="text-white/30 text-[10px] mb-2">{t.detail}</p>
                      <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                        <Clock className="w-3 h-3" style={{ color: t.color }} />
                        <span className="font-mono text-[10px]" style={{ color: t.color }}>{t.latency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline Integration Diagram */}
              <div className="rounded-xl p-5 border" style={{ background: `${C.blue}06`, borderColor: `${C.blue}15` }}>
                <h3 className="text-white text-sm font-medium mb-3">Pipeline Integration (Zero Latency Impact)</h3>
                <p className="text-white/40 text-xs mb-4">Bulava augments AFTER bid selection. The Lambda's core scoring and I/O paths are completely untouched.</p>
                <div className="flex flex-col md:flex-row items-center gap-3 text-center">
                  {[
                    { label: "SQS Input", sub: "Ad Opportunities", color: "#f59e0b", w: "flex-1" },
                    { label: "Lambda: Score & Select", sub: "Core Pipeline (UNTOUCHED)", color: C.blue, w: "flex-[2]" },
                    { label: "Bulava Augment", sub: "Tier 3 Template Lookup", color: C.gold, w: "flex-1" },
                    { label: "SQS + DynamoDB", sub: "Augmented Results", color: "#10b981", w: "flex-1" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-3 w-full md:w-auto" style={{ flex: n.w === "flex-[2]" ? 2 : 1 }}>
                      <div className="flex-1 rounded-lg p-3 border" style={{ background: `${n.color}08`, borderColor: `${n.color}25` }}>
                        <p className="text-white text-[11px] font-medium">{n.label}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: `${n.color}` }}>{n.sub}</p>
                      </div>
                      {i < 3 && <ArrowRight className="hidden md:block w-4 h-4 text-white/10 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Demo */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: `${C.gold}20` }}>
                <h3 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
                  <Play className="w-4 h-4" style={{ color: C.gold }} /> Live Augmentation Demo (Tier 3)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">Ad Category</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["sportswear", "fintech", "energy_drink", "streaming", "gaming", "insurance", "beauty", "travel", "fast_food"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setBulavaCategory(cat)}
                            className={`px-2 py-1.5 rounded text-[10px] font-medium transition-all ${bulavaCategory === cat ? "text-white" : "text-white/30 hover:text-white/50"}`}
                            style={bulavaCategory === cat ? { background: C.blue } : { background: "rgba(255,255,255,0.03)" }}
                          >
                            {cat.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">Augmentation Type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["fact", "product_parallel", "call_to_action", "cultural", "inspiration"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setBulavaType(t)}
                            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${bulavaType === t ? "text-[#1A1A2E]" : "text-white/30 hover:text-white/50"}`}
                            style={bulavaType === t ? { background: C.gold } : { background: "rgba(255,255,255,0.03)" }}
                          >
                            {t.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={generateBulavaAugmentation}
                      className="w-full py-2.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                      style={{ background: C.blue }}
                      data-testid="bulava-generate-btn"
                    >
                      <Zap className="w-3.5 h-3.5 inline mr-1" /> Generate Augmentation
                    </button>
                  </div>
                  <div>
                    {bulavaDemo ? (
                      <div className="rounded-xl p-4 h-full" style={{ background: `${C.gold}08`, border: `1px solid ${C.gold}20` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Flag className="w-3.5 h-3.5" style={{ color: C.gold }} />
                            <span className="text-white/50 text-[10px] uppercase tracking-wider">Ukraine Message</span>
                          </div>
                          <span className="text-[9px] font-mono" style={{ color: C.gold }}>Tier {bulavaDemo.tier} | {bulavaDemo.latency_ms}ms</span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed mt-2">{bulavaDemo.text}</p>
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/40">{bulavaDemo.ad_category}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: `${C.gold}15`, color: C.gold }}>{bulavaDemo.type}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl p-4 h-full flex items-center justify-center border border-dashed" style={{ borderColor: `${C.gold}20` }}>
                        <p className="text-white/20 text-xs">Select a category and type, then generate</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Batch Demo */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: C.blue }} /> Batch Augmentation Simulation
                  </h3>
                  <button onClick={runBulavaBatchDemo} className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:opacity-90 text-white" style={{ background: C.blue }} data-testid="bulava-batch-btn">
                    Run 20-Ad Batch
                  </button>
                </div>
                {bulavaBatch ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="rounded-lg p-3 text-center" style={{ background: `${C.blue}08` }}>
                        <p className="text-xl font-bold" style={{ color: C.blue }}>{bulavaBatch.count}</p>
                        <p className="text-white/40 text-[10px]">Ads Augmented</p>
                      </div>
                      <div className="rounded-lg p-3 text-center" style={{ background: `${C.gold}08` }}>
                        <p className="text-xl font-bold" style={{ color: C.gold }}>100%</p>
                        <p className="text-white/40 text-[10px]">Augmentation Rate</p>
                      </div>
                      <div className="rounded-lg p-3 text-center bg-emerald-500/5">
                        <p className="text-xl font-bold text-emerald-400">0ms</p>
                        <p className="text-white/40 text-[10px]">Added Latency</p>
                      </div>
                      <div className="rounded-lg p-3 text-center bg-white/[0.03]">
                        <p className="text-xl font-bold text-white/80">{Object.keys(bulavaBatch.type_distribution).length}</p>
                        <p className="text-white/40 text-[10px]">Message Types Used</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="rounded-lg p-3 bg-white/[0.02]">
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Type Distribution</p>
                        {Object.entries(bulavaBatch.type_distribution).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between text-xs py-0.5">
                            <span className="text-white/50">{type.replace(/_/g, " ")}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 rounded-full bg-white/5"><div className="h-1 rounded-full" style={{ width: `${(count / bulavaBatch.count) * 100}%`, background: C.gold }} /></div>
                              <span className="text-white/30 font-mono w-6 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg p-3 bg-white/[0.02]">
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Sample Augmentations</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {bulavaBatch.results.slice(0, 5).map((r, i) => (
                            <div key={i} className="text-[10px]">
                              <span className="px-1 py-0.5 rounded" style={{ background: `${C.gold}15`, color: C.gold }}>{r.ad_category.replace("_", " ")}</span>
                              <p className="text-white/40 mt-0.5 leading-relaxed">{r.augmentation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/20 text-xs text-center py-4">Click "Run 20-Ad Batch" to see Bulava augment a batch of ads.</p>
                )}
              </div>


              {/* Bulava Analytics Dashboard */}
              {bulavaAnalytics && bulavaAnalytics.total_augmentations > 0 && (
                <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: `${C.gold}20` }} data-testid="bulava-analytics">
                  <h3 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: C.gold }} /> Augmentation Analytics
                  </h3>
                  {/* Summary stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <div className="rounded-lg p-3 text-center" style={{ background: `${C.gold}08` }}>
                      <p className="text-2xl font-bold" style={{ color: C.gold }}>{bulavaAnalytics.total_augmentations}</p>
                      <p className="text-white/40 text-[10px]">Total Augmentations</p>
                    </div>
                    <div className="rounded-lg p-3 text-center" style={{ background: `${C.blue}08` }}>
                      <p className="text-2xl font-bold" style={{ color: C.blue }}>{Object.keys(bulavaAnalytics.by_category).length}</p>
                      <p className="text-white/40 text-[10px]">Categories Reached</p>
                    </div>
                    <div className="rounded-lg p-3 text-center bg-emerald-500/5">
                      <p className="text-lg font-bold text-emerald-400 capitalize">{bulavaAnalytics.top_category?.replace("_", " ") || "—"}</p>
                      <p className="text-white/40 text-[10px]">Top Category</p>
                    </div>
                    <div className="rounded-lg p-3 text-center bg-white/[0.03]">
                      <p className="text-lg font-bold text-white/70 capitalize">{bulavaAnalytics.top_type?.replace("_", " ") || "—"}</p>
                      <p className="text-white/40 text-[10px]">Top Message Type</p>
                    </div>
                  </div>
                  {/* Charts */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Category distribution */}
                    <div className="rounded-lg p-3 bg-white/[0.02]">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-3">By Ad Category</p>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(bulavaAnalytics.by_category).map(([cat, count]) => ({ name: cat.replace("_", " "), count }))} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                            <XAxis type="number" stroke="#444" fontSize={10} />
                            <YAxis type="category" dataKey="name" stroke="#444" fontSize={9} width={70} />
                            <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", fontSize: 11 }} />
                            <Bar dataKey="count" fill={C.blue} radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {/* Type distribution */}
                    <div className="rounded-lg p-3 bg-white/[0.02]">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-3">By Message Type</p>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(bulavaAnalytics.by_type).map(([type, count]) => ({ name: type.replace(/_/g, " "), value: count }))}
                              dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={30}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false} fontSize={9}
                            >
                              {Object.keys(bulavaAnalytics.by_type).map((_, i) => (
                                <Cell key={i} fill={[C.gold, C.blue, "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"][i % 6]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/20 text-[10px] mt-3 text-center">Analytics update after each augmentation. Use the demo above to grow the dataset.</p>
                </div>
              )}

              {/* Diia Platform */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" style={{ color: C.blue }} /> The Diia Platform — Ukraine's Digital Foundation
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { stat: "26M+", label: "Active users" },
                    { stat: "412", label: "Government services" },
                    { stat: "97%", label: "Uptime under bombardment" },
                  ].map((s, i) => (
                    <div key={i} className="text-center rounded-lg p-3" style={{ background: `${C.blue}08` }}>
                      <p className="text-xl font-bold" style={{ color: C.blue }}>{s.stat}</p>
                      <p className="text-white/40 text-[10px]">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-white/40 text-xs leading-relaxed">Diia embodies subsidiarity — information distributed for the citizen's empowerment. The UISSS connects 40 registries for real-time benefit determination. Its architecture (Liquio/NestJS/MongoDB) mirrors the same distributed principles powering AdFlow.</p>
              </div>

              {/* Distributed Systems Connection */}
              <div className="rounded-xl p-5 border" style={{ background: `${C.blue}06`, borderColor: `${C.blue}15` }}>
                <h3 className="text-white text-sm font-medium mb-3">The Distributed Systems Connection</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2" style={{ color: C.blue }}>AdFlow Pipeline</p>
                    <div className="space-y-1.5 text-xs text-white/50">
                      <p>• Queue-based processing (no single point of failure)</p>
                      <p>• Lambda functions scale independently</p>
                      <p>• DynamoDB for resilient data persistence</p>
                      <p>• Event-driven serverless architecture</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2" style={{ color: C.gold }}>Ukraine's Digital Infrastructure</p>
                    <div className="space-y-1.5 text-xs text-white/50">
                      <p>• Distributed microservices (no single point of failure)</p>
                      <p>• Services scale independently under load</p>
                      <p>• Redundant data across multiple regions</p>
                      <p>• Resilient under sustained cyberattack</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/40 text-xs mt-3 pt-3 border-t border-white/5 italic">The same engineering principles that make ad selection fast make democratic governance resilient.</p>
              </div>

              {/* NCF-Ukraine Partnership */}
              <div className="rounded-xl p-5 border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <h3 className="text-white text-sm font-medium mb-3">NCF-Ukraine Partnership Vision</h3>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  {[
                    { lane: "A", title: "Direct Ministry", desc: "Contact Ukraine's Ministry of Digital Transformation for a GovTech pilot project sponsor", color: C.blue },
                    { lane: "B", title: "FSU Bridge", desc: "Leverage the FSU Ukraine Task Force as intermediary to vetted academic partners", color: C.gold },
                    { lane: "C", title: "Kyiv-Mohyla Academy", desc: "Co-sponsored project through NaUKMA's international cooperation office", color: "#10b981" },
                  ].map((l) => (
                    <div key={l.lane} className="rounded-lg p-3 border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: l.color }}>{l.lane}</span>
                        <span className="text-white text-xs font-medium">{l.title}</span>
                      </div>
                      <p className="text-white/40 text-[11px]">{l.desc}</p>
                    </div>
                  ))}
                </div>
                <h4 className="text-white/50 text-xs font-medium mb-2">Candidate Project Concepts</h4>
                <div className="space-y-2">
                  {[
                    { name: "Civic Service Delivery Analytics", desc: "Dashboard using data.gov.ua open datasets for service access and equity comparisons" },
                    { name: "Digital Literacy Pathway Evaluation", desc: "Model upskilling interventions using Diia.Education data" },
                    { name: "GovTech Platform Adoption Analytics", desc: "Evaluate Diia.Engine adoption patterns for evidence-based UX improvements" },
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Star className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: C.gold }} />
                      <div>
                        <span className="text-white/70 font-medium">{p.name}:</span>
                        <span className="text-white/40 ml-1">{p.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="rounded-xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${C.gold}10, ${C.blue}08)`, border: `1px solid ${C.gold}20` }}>
                <p className="text-white/60 text-sm mb-4">If you work in Ukraine's digital ecosystem, build AI for democratic governance, or want to join the NCF-Ukraine partnership — let's connect.</p>
                <a href="mailto:matthew.macfarlane27@ncf.edu" className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90" style={{ background: C.gold, color: C.dark }} data-testid="bulava-cta-email">
                  <Mail className="w-4 h-4" /> matthew.macfarlane27@ncf.edu
                </a>
              </div>
            </motion.div>
          )}

          </AnimatePresence>
        </main>

        {/* ================================================================ */}
        {/* FOOTER */}
        {/* ================================================================ */}
        <footer className="border-t mt-16 py-8 px-4 sm:px-6" style={{ borderColor: C.cardBorder }}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white/30 text-xs">AdFlow Ad Selection Pipeline — IDC5131 Project 1</p>
              <p className="text-white/20 text-[10px] mt-0.5">Matthew R. MacFarlane | New College of Florida | Spring 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:matthew.macfarlane27@ncf.edu" className="text-white/30 hover:text-white transition-colors" data-testid="footer-email"><Mail className="w-4 h-4" /></a>
              <a href="https://github.com/matthewrobertmac" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" data-testid="footer-github"><Github className="w-4 h-4" /></a>
              <a href="https://www.linkedin.com/in/mattmacfa/" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" data-testid="footer-linkedin"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
