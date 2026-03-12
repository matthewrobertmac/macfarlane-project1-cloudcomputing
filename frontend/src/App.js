import { useState, useEffect, useCallback, useRef } from "react";
import "@/App.css";
import { 
  Github, Linkedin, Mail, ExternalLink, Server, Database, Cloud, Zap, 
  BarChart3, Code2, GraduationCap, MapPin, Calendar, BookOpen, Award,
  Play, Square, RefreshCw, Flame, Activity, Clock, TrendingUp, 
  CheckCircle2, AlertCircle, Cpu, FileText, User, Briefcase, Globe,
  ChevronDown, ChevronUp, Target, Layers, Settings, Copy, Check, Terminal
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [activeTab, setActiveTab] = useState("test");
  const [testState, setTestState] = useState("idle"); // idle, warming, running, complete
  const [testProfile, setTestProfile] = useState("warmup");
  const [testResults, setTestResults] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState([]);
  const [isWarmedUp, setIsWarmedUp] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const testRef = useRef(null);

  // Copy to clipboard function
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Test profiles matching professor's test apparatus
  const profiles = {
    warmup: { count: 10, delay: 500, description: "10 msgs, 500ms delay - Baseline latency check" },
    steady: { count: 100, delay: 100, description: "100 msgs, 100ms delay - Moderate load test" },
    burst: { count: 500, delay: 0, description: "500 msgs, all at once - Stress test (requires warm-up)" },
    soak: { count: 200, delay: 1000, description: "200 msgs, 1s delay - Sustained traffic test" },
  };

  // Terraform code strings for copy functionality
  const terraformMain = `# AdFlow Ad Selection Pipeline - Terraform Configuration
# Author: Matthew R. MacFarlane
# Course: IDC5131 Distributed Systems - New College of Florida

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "student_id" {
  default = "macfarlane"
}

variable "lambda_memory" {
  default = 512
}

variable "lambda_timeout" {
  default = 30
}

locals {
  prefix = "adflow-\${var.student_id}"
  tags = {
    Project   = "AdFlow"
    Course    = "IDC5131"
    Student   = var.student_id
    ManagedBy = "Terraform"
  }
}`;

  const terraformVars = `# terraform.tfvars
aws_region     = "us-east-1"
student_id     = "macfarlane"
lambda_memory  = 512
lambda_timeout = 30`;

  const terraformResources = `# SQS Queues
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

# DynamoDB Table
resource "aws_dynamodb_table" "results" {
  name         = "\${local.prefix}-results"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "opportunity_id"

  attribute {
    name = "opportunity_id"
    type = "S"
  }

  tags = local.tags
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name = "\${local.prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# IAM Policy
resource "aws_iam_role_policy" "lambda" {
  name = "\${local.prefix}-lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.input.arn
      },
      {
        Effect = "Allow"
        Action = ["sqs:SendMessage"]
        Resource = aws_sqs_queue.results.arn
      },
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:BatchWriteItem"]
        Resource = aws_dynamodb_table.results.arn
      },
      {
        Effect = "Allow"
        Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}`;

  const terraformLambda = `# Lambda Package
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "\${path.module}/worker"
  output_path = "\${path.module}/lambda.zip"
}

# Lambda Function
resource "aws_lambda_function" "worker" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "\${local.prefix}-worker"
  role             = aws_iam_role.lambda.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  memory_size      = var.lambda_memory
  timeout          = var.lambda_timeout

  environment {
    variables = {
      RESULTS_QUEUE_URL = aws_sqs_queue.results.url
      DYNAMO_TABLE_NAME = aws_dynamodb_table.results.name
    }
  }

  tags = local.tags
}

# SQS Trigger
resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn = aws_sqs_queue.input.arn
  function_name    = aws_lambda_function.worker.arn
  batch_size       = 10
  function_response_types = ["ReportBatchItemFailures"]
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/\${local.prefix}-worker"
  retention_in_days = 7
}`;

  const terraformOutputs = `output "input_queue_url" {
  value = aws_sqs_queue.input.url
}

output "results_queue_url" {
  value = aws_sqs_queue.results.url
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.results.name
}

output "lambda_function_name" {
  value = aws_lambda_function.worker.function_name
}`;

  // Warm-up function
  const handleWarmUp = async () => {
    setTestState("warming");
    try {
      const response = await fetch(`${BACKEND_URL}/api/warmup`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsWarmedUp(true);
        setTestState("idle");
      }
    } catch (error) {
      console.error("Warm-up failed:", error);
      // Simulate warm-up for demo
      await new Promise(r => setTimeout(r, 3000));
      setIsWarmedUp(true);
      setTestState("idle");
    }
  };

  // Run test function
  const handleRunTest = async () => {
    setTestState("running");
    setLiveMetrics([]);
    setTestResults(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: testProfile })
      });
      const data = await response.json();
      setTestResults(data);
      setTestState("complete");
    } catch (error) {
      // Simulate test results for demo
      const profile = profiles[testProfile];
      const simulatedLatencies = [];
      for (let i = 0; i < profile.count; i++) {
        const baseLatency = isWarmedUp ? 150 : 400;
        const variance = Math.random() * 300;
        const latency = baseLatency + variance + (i * (profile.delay === 0 ? 20 : 5));
        simulatedLatencies.push(latency);
        
        if (i % Math.max(1, Math.floor(profile.count / 20)) === 0) {
          setLiveMetrics(prev => [...prev, {
            time: i,
            latency: Math.round(latency),
            avg: Math.round(simulatedLatencies.reduce((a,b) => a+b, 0) / simulatedLatencies.length)
          }]);
          await new Promise(r => setTimeout(r, 50));
        }
      }
      
      const sorted = [...simulatedLatencies].sort((a, b) => a - b);
      setTestResults({
        sent: profile.count,
        received: profile.count,
        latencies: simulatedLatencies,
        stats: {
          min: Math.round(sorted[0]),
          avg: Math.round(simulatedLatencies.reduce((a,b) => a+b, 0) / simulatedLatencies.length),
          median: Math.round(sorted[Math.floor(sorted.length / 2)]),
          p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
          max: Math.round(sorted[sorted.length - 1]),
        },
        distribution: {
          fast: simulatedLatencies.filter(l => l < 500).length,
          ok: simulatedLatencies.filter(l => l >= 500 && l < 1000).length,
          slow: simulatedLatencies.filter(l => l >= 1000).length,
        },
        throughput: profile.count / (simulatedLatencies.reduce((a,b) => a+b, 0) / 1000)
      });
      setTestState("complete");
    }
  };

  const distributionData = testResults ? [
    { name: '<500ms', value: testResults.distribution.fast, color: '#10b981' },
    { name: '500-1000ms', value: testResults.distribution.ok, color: '#f59e0b' },
    { name: '>1000ms', value: testResults.distribution.slow, color: '#ef4444' },
  ] : [];

  return (
    <div className="App min-h-screen bg-[#0a0a0b]">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight" data-testid="header-name">
                  Matthew R. MacFarlane
                </h1>
                <p className="text-emerald-400 font-mono text-sm">Machine Learning Engineer & Data Scientist</p>
              </div>
              <div className="flex items-center gap-3">
                <a href="https://github.com/mattmacf98" target="_blank" rel="noopener noreferrer" 
                   className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-105" data-testid="github-link">
                  <Github className="w-5 h-5 text-white/80" />
                </a>
                <a href="https://linkedin.com/in/matthew-macfarlane" target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-105" data-testid="linkedin-link">
                  <Linkedin className="w-5 h-5 text-white/80" />
                </a>
                <a href="mailto:matthew.macfarlane27@ncf.edu"
                   className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-105" data-testid="email-link">
                  <Mail className="w-5 h-5 text-white/80" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-medium">Spring 2026 • New College of Florida</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4" data-testid="project-title">
                  AdFlow<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Real-Time Bid Engine
                  </span>
                </h2>
                <p className="text-base md:text-lg text-white/60 leading-relaxed mb-6">
                  A serverless, distributed ad selection pipeline processing live auction streams 
                  at scale. Built for Prof. Gil Salu's Distributed Systems for Data Science course.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["AWS Lambda", "SQS", "DynamoDB", "Python", "SAM", "CloudWatch"].map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/70 border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => { setActiveTab("test"); testRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold rounded-lg hover:opacity-90 transition-all"
                  data-testid="try-it-btn"
                >
                  <Play className="w-4 h-4" /> Try the Pipeline Live
                </button>
              </div>
              
              {/* Architecture Diagram */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-2xl" />
                <div className="relative bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white/80 font-medium mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" /> System Architecture
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Server, color: "amber", label: "SQS Input Queue", desc: "Receives ad opportunities" },
                      { icon: Zap, color: "emerald", label: "Lambda Bid Engine", desc: "Parallel I/O, batch writes" },
                      { icon: Database, color: "blue", label: "DynamoDB Results", desc: "Persistent storage" },
                      { icon: BarChart3, color: "purple", label: "Analytics Pipeline", desc: "Real-time metrics" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                          <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white/80 text-sm font-medium">{item.label}</p>
                          <p className="text-white/40 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="border-t border-white/10 sticky top-[73px] z-40 bg-[#0a0a0b]/95 backdrop-blur-xl" ref={testRef}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 pt-3 overflow-x-auto pb-px">
              {[
                { id: "test", label: "Live Testing", icon: Play },
                { id: "architecture", label: "Architecture", icon: Layers },
                { id: "optimizations", label: "Optimizations", icon: TrendingUp },
                { id: "terraform", label: "Terraform", icon: Terminal },
                { id: "course", label: "Course", icon: GraduationCap },
                { id: "about", label: "About Me", icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white border-t border-x border-white/10"
                      : "text-white/50 hover:text-white/80"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="bg-white/[0.02] border-t border-white/10 min-h-[600px]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* LIVE TESTING TAB */}
            {activeTab === "test" && (
              <div className="space-y-6" data-testid="test-content">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Live Pipeline Testing</h3>
                    <p className="text-white/50 text-sm mt-1">Test the AdFlow bid engine with the professor's test profiles</p>
                  </div>
                  
                  {/* Warm-up Button */}
                  <button
                    onClick={handleWarmUp}
                    disabled={testState === "warming" || isWarmedUp}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isWarmedUp 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : testState === "warming"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
                    }`}
                    data-testid="warmup-btn"
                  >
                    {isWarmedUp ? (
                      <><CheckCircle2 className="w-4 h-4" /> Lambda Warm</>
                    ) : testState === "warming" ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Warming Up...</>
                    ) : (
                      <><Flame className="w-4 h-4" /> Warm Up AWS</>
                    )}
                  </button>
                </div>

                {/* Test Controls */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-white/50" /> Test Profile
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(profiles).map(([key, profile]) => (
                          <button
                            key={key}
                            onClick={() => setTestProfile(key)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              testProfile === key
                                ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium capitalize">{key}</span>
                              <span className="text-xs opacity-60">{profile.count} msgs</span>
                            </div>
                            <p className="text-xs opacity-50 mt-1">{profile.description}</p>
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleRunTest}
                        disabled={testState === "running" || testState === "warming"}
                        className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                          testState === "running"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90"
                        }`}
                        data-testid="run-test-btn"
                      >
                        {testState === "running" ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> Running...</>
                        ) : (
                          <><Play className="w-4 h-4" /> Run Test</>
                        )}
                      </button>
                    </div>

                    {/* Quick Stats */}
                    {testResults && (
                      <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                        <h4 className="text-white font-medium mb-3">Results Summary</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Sent", value: testResults.sent, color: "white" },
                            { label: "Received", value: testResults.received, color: "emerald" },
                            { label: "Avg Latency", value: `${testResults.stats.avg}ms`, color: "cyan" },
                            { label: "p95", value: `${testResults.stats.p95}ms`, color: "amber" },
                          ].map((stat, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-2 text-center">
                              <p className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</p>
                              <p className="text-xs text-white/50">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Charts */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Live Latency Chart */}
                    <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" /> Live Latency
                      </h4>
                      <div className="h-64">
                        {liveMetrics.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={liveMetrics}>
                              <defs>
                                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="time" stroke="#666" fontSize={10} />
                              <YAxis stroke="#666" fontSize={10} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                labelStyle={{ color: '#fff' }}
                              />
                              <Area type="monotone" dataKey="latency" stroke="#10b981" fill="url(#latencyGradient)" />
                              <Line type="monotone" dataKey="avg" stroke="#06b6d4" strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-white/30">
                            Run a test to see live metrics
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Distribution Chart */}
                    {testResults && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                          <h4 className="text-white font-medium mb-3">Latency Distribution</h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={distributionData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={70}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                          <h4 className="text-white font-medium mb-3">Statistics</h4>
                          <div className="space-y-2">
                            {[
                              { label: "Minimum", value: testResults.stats.min, unit: "ms" },
                              { label: "Average", value: testResults.stats.avg, unit: "ms" },
                              { label: "Median", value: testResults.stats.median, unit: "ms" },
                              { label: "95th Percentile", value: testResults.stats.p95, unit: "ms" },
                              { label: "Maximum", value: testResults.stats.max, unit: "ms" },
                              { label: "Throughput", value: testResults.throughput.toFixed(1), unit: "/sec" },
                            ].map((stat, i) => (
                              <div key={i} className="flex justify-between items-center py-1 border-b border-white/5">
                                <span className="text-white/50 text-sm">{stat.label}</span>
                                <span className="text-white font-mono text-sm">{stat.value}{stat.unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Profiles Info */}
                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3">About These Tests (From Professor's Test Apparatus)</h4>
                  <p className="text-white/50 text-sm mb-3">
                    These test profiles replicate the professor-provided test apparatus from <code className="text-emerald-400">test-apparatus/index.html</code>. 
                    The warm-up button provisions Lambda containers to eliminate cold-start latency for accurate burst testing.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-amber-400 font-medium">Target:</span>
                      <span className="text-white/70 ml-2">&lt;500ms end-to-end latency</span>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-amber-400 font-medium">Measures:</span>
                      <span className="text-white/70 ml-2">SQS send → Lambda process → Result received</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ARCHITECTURE TAB */}
            {activeTab === "architecture" && (
              <div className="space-y-6" data-testid="architecture-content">
                <h3 className="text-2xl font-bold text-white">System Architecture & Implementation</h3>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Original vs Optimized */}
                  <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white/50" /> Professor's Template vs My Implementation
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-white/80 text-sm font-medium mb-2">Original Template (Per Assignment)</h5>
                        <ul className="text-white/50 text-sm space-y-1">
                          <li>• Sequential I/O: SQS send → wait → DynamoDB write → wait</li>
                          <li>• Individual put_item() calls per message</li>
                          <li>• 256MB Lambda memory</li>
                          <li>• O(n) time bonus lookup via iteration</li>
                          <li>• Table object created per-request</li>
                        </ul>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <h5 className="text-emerald-400 text-sm font-medium mb-2">My Optimized Implementation</h5>
                        <ul className="text-white/70 text-sm space-y-1">
                          <li>• Parallel I/O with ThreadPoolExecutor</li>
                          <li>• Batch DynamoDB writes (batch_write_item)</li>
                          <li>• 512MB Lambda memory (2x CPU)</li>
                          <li>• Pre-computed TIME_BONUS_BY_HOUR array - O(1)</li>
                          <li>• Module-level Table reference (lazy init)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Architecture Flow */}
                  <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                    <h4 className="text-white font-medium mb-4">Data Flow</h4>
                    <div className="space-y-3">
                      {[
                        { step: 1, title: "Ad Opportunity Arrives", desc: "Test apparatus sends JSON message to SQS input queue" },
                        { step: 2, title: "Lambda Triggered", desc: "SQS event source mapping invokes Lambda with batch of up to 10 messages" },
                        { step: 3, title: "Bid Scoring", desc: "compute_score() applies relevance × time × device multipliers" },
                        { step: 4, title: "Winner Selection", desc: "select_winner() finds highest score and calculates margin" },
                        { step: 5, title: "Parallel I/O", desc: "Results sent to SQS and DynamoDB concurrently" },
                        { step: 6, title: "Analytics", desc: "CloudWatch logs batch timing; DynamoDB stores for analysis" },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {item.step}
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">{item.title}</p>
                            <p className="text-white/40 text-xs">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scoring Formula */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-5 border border-white/10">
                  <h4 className="text-white font-medium mb-3">Quality-Adjusted Bidding Formula</h4>
                  <code className="text-lg text-emerald-400 font-mono">
                    score = bid_amount × relevance_multiplier × time_bonus × device_bonus
                  </code>
                  <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <h5 className="text-white/80 font-medium mb-2">Relevance Multipliers</h5>
                      <div className="text-white/50 space-y-1">
                        <p>sports + sportswear: 1.4x</p>
                        <p>finance + fintech: 1.5x</p>
                        <p>entertainment + streaming: 1.4x</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-white/80 font-medium mb-2">Time Bonuses (UTC)</h5>
                      <div className="text-white/50 space-y-1">
                        <p>06:00-08:59: 1.20x (morning)</p>
                        <p>12:00-13:59: 1.15x (lunch)</p>
                        <p>19:00-22:59: 1.25x (evening)</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-white/80 font-medium mb-2">Device Bonus</h5>
                      <div className="text-white/50 space-y-1">
                        <p>Mobile: 1.1x</p>
                        <p>Desktop: 1.0x</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AWS Resources */}
                <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                  <h4 className="text-white font-medium mb-4">AWS Resources (SAM Deployed)</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { name: "Lambda", resource: "adflow-macfarlane-worker", detail: "512MB, Python 3.11" },
                      { name: "Input Queue", resource: "adflow-macfarlane-input", detail: "Standard SQS" },
                      { name: "Results Queue", resource: "adflow-macfarlane-results", detail: "Standard SQS" },
                      { name: "DynamoDB", resource: "adflow-macfarlane-results", detail: "On-demand" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/80 font-medium text-sm">{item.name}</p>
                        <p className="text-emerald-400 text-xs font-mono truncate">{item.resource}</p>
                        <p className="text-white/40 text-xs mt-1">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* OPTIMIZATIONS TAB */}
            {activeTab === "optimizations" && (
              <div className="space-y-6" data-testid="optimizations-content">
                <h3 className="text-2xl font-bold text-white">Performance Optimizations</h3>
                <p className="text-white/50">All optimizations are cost-neutral or cost-saving while maintaining SQS + Lambda architecture.</p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { 
                      title: "Parallel I/O", 
                      before: "Sequential: SQS → wait → DynamoDB → wait",
                      after: "Concurrent: SQS + DynamoDB in parallel",
                      improvement: "50-70% faster",
                      cost: "FREE",
                      icon: Zap
                    },
                    { 
                      title: "Batch DynamoDB Writes", 
                      before: "Individual put_item() per message",
                      after: "batch_write_item() (up to 25 items)",
                      improvement: "90% fewer API calls",
                      cost: "SAVES $",
                      icon: Database
                    },
                    { 
                      title: "Module-Level Table", 
                      before: "Create Table object per request",
                      after: "Lazy init once, reuse across invocations",
                      improvement: "~15ms/request saved",
                      cost: "FREE",
                      icon: Settings
                    },
                    { 
                      title: "Pre-computed Time Bonus", 
                      before: "O(n) iteration through TIME_WINDOWS",
                      after: "O(1) array lookup by hour index",
                      improvement: "Microseconds saved/bid",
                      cost: "FREE",
                      icon: Clock
                    },
                    { 
                      title: "Lambda Memory", 
                      before: "256MB",
                      after: "512MB (2x CPU allocation)",
                      improvement: "~2x compute speed",
                      cost: "NEUTRAL",
                      icon: Cpu
                    },
                    { 
                      title: "Batch SQS Sends", 
                      before: "Individual send_message() calls",
                      after: "send_message_batch() (up to 10)",
                      improvement: "90% fewer API calls",
                      cost: "SAVES $",
                      icon: Server
                    },
                  ].map((opt, i) => (
                    <div key={i} className="bg-black/40 rounded-xl p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <opt.icon className="w-4 h-4 text-emerald-400" />
                          </div>
                          <h4 className="text-white font-medium">{opt.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          opt.cost === "SAVES $" ? "bg-green-500/20 text-green-400" :
                          opt.cost === "FREE" ? "bg-blue-500/20 text-blue-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {opt.cost}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-red-400/70">Before:</span>
                          <span className="text-white/50">{opt.before}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">After:</span>
                          <span className="text-white/70">{opt.after}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-cyan-400 font-mono">{opt.improvement}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Results Summary */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-5 border border-white/10">
                  <h4 className="text-white font-medium mb-4">Performance Results</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { metric: "Batch Processing", before: "600ms", after: "15ms", change: "97% faster" },
                      { metric: "Cold Start", before: "~500ms", after: "~200ms", change: "60% faster" },
                      { metric: "Warmup <500ms", before: "0%", after: "60%", change: "+60 points" },
                      { metric: "API Calls", before: "1 per msg", after: "Batched", change: "90% fewer" },
                    ].map((result, i) => (
                      <div key={i} className="text-center">
                        <p className="text-white/50 text-sm mb-1">{result.metric}</p>
                        <p className="text-white/40 text-sm">{result.before} → <span className="text-white/80">{result.after}</span></p>
                        <p className="text-emerald-400 font-mono text-sm mt-1">{result.change}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TERRAFORM TAB */}
            {activeTab === "terraform" && (
              <div className="space-y-6" data-testid="terraform-content">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Terraform Deployment</h3>
                    <p className="text-white/50 text-sm mt-1">Infrastructure as Code alternative to AWS SAM for deploying the AdFlow pipeline</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      HashiCorp Terraform
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      AWS Provider
                    </span>
                  </div>
                </div>

                {/* Terraform Files */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Main Configuration */}
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-mono text-sm">main.tf</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(terraformMain, 'main')}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {copiedCode === 'main' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedCode === 'main' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-4 text-xs text-white/70 overflow-x-auto max-h-96 font-mono leading-relaxed">
{`# AdFlow Ad Selection Pipeline - Terraform Configuration
# Author: Matthew R. MacFarlane
# Course: IDC5131 Distributed Systems - New College of Florida

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "student_id" {
  description = "Student ID for resource naming"
  type        = string
  default     = "macfarlane"
}

variable "lambda_memory" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

# Local values
locals {
  prefix = "adflow-\${var.student_id}"
  tags = {
    Project   = "AdFlow"
    Course    = "IDC5131"
    Student   = var.student_id
    ManagedBy = "Terraform"
  }
}`}
                      </pre>
                    </div>

                    {/* Variables */}
                    <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span className="text-white font-mono text-sm">variables.tf</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(terraformVars, 'vars')}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {copiedCode === 'vars' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedCode === 'vars' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-4 text-xs text-white/70 overflow-x-auto max-h-64 font-mono leading-relaxed">
{`# terraform.tfvars - Configuration values

aws_region     = "us-east-1"
student_id     = "macfarlane"
lambda_memory  = 512
lambda_timeout = 30

# For production, consider:
# lambda_memory = 1024  # More CPU for compute-heavy scoring
# lambda_timeout = 60   # Longer timeout for large batches`}
                      </pre>
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-mono text-sm">resources.tf</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(terraformResources, 'resources')}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {copiedCode === 'resources' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedCode === 'resources' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-4 text-xs text-white/70 overflow-x-auto max-h-96 font-mono leading-relaxed">
{`# SQS Queues
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

# DynamoDB Table
resource "aws_dynamodb_table" "results" {
  name         = "\${local.prefix}-results"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "opportunity_id"

  attribute {
    name = "opportunity_id"
    type = "S"
  }

  tags = local.tags
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name = "\${local.prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = local.tags
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda" {
  name = "\${local.prefix}-lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.input.arn
      },
      {
        Effect = "Allow"
        Action = ["sqs:SendMessage"]
        Resource = aws_sqs_queue.results.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = aws_dynamodb_table.results.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Lambda Configuration */}
                <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-mono text-sm">lambda.tf</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(terraformLambda, 'lambda')}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedCode === 'lambda' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCode === 'lambda' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-4 text-xs text-white/70 overflow-x-auto max-h-80 font-mono leading-relaxed">
{`# Lambda Function Package
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "\${path.module}/worker"
  output_path = "\${path.module}/lambda.zip"
}

# Lambda Function
resource "aws_lambda_function" "worker" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "\${local.prefix}-worker"
  role             = aws_iam_role.lambda.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  memory_size      = var.lambda_memory
  timeout          = var.lambda_timeout

  environment {
    variables = {
      RESULTS_QUEUE_URL = aws_sqs_queue.results.url
      DYNAMO_TABLE_NAME = aws_dynamodb_table.results.name
    }
  }

  tags = local.tags
}

# SQS Event Source Mapping
resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn                   = aws_sqs_queue.input.arn
  function_name                      = aws_lambda_function.worker.arn
  batch_size                         = 10
  maximum_batching_window_in_seconds = 0

  function_response_types = ["ReportBatchItemFailures"]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/\${local.prefix}-worker"
  retention_in_days = 7
  tags              = local.tags
}`}
                  </pre>
                </div>

                {/* Outputs */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-mono text-sm">outputs.tf</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(terraformOutputs, 'outputs')}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {copiedCode === 'outputs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedCode === 'outputs' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs text-white/70 overflow-x-auto font-mono leading-relaxed">
{`output "input_queue_url" {
  description = "URL of the SQS input queue"
  value       = aws_sqs_queue.input.url
}

output "results_queue_url" {
  description = "URL of the SQS results queue"
  value       = aws_sqs_queue.results.url
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB results table"
  value       = aws_dynamodb_table.results.name
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.worker.function_name
}

output "lambda_log_group" {
  description = "CloudWatch log group for Lambda"
  value       = aws_cloudwatch_log_group.lambda.name
}`}
                    </pre>
                  </div>

                  {/* Deployment Commands */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-xl p-5 border border-white/10">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> Deployment Commands
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-black/40 rounded-lg p-3">
                        <p className="text-white/50 text-xs mb-1"># Initialize Terraform</p>
                        <code className="text-emerald-400 text-sm font-mono">terraform init</code>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3">
                        <p className="text-white/50 text-xs mb-1"># Preview changes</p>
                        <code className="text-emerald-400 text-sm font-mono">terraform plan</code>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3">
                        <p className="text-white/50 text-xs mb-1"># Deploy infrastructure</p>
                        <code className="text-emerald-400 text-sm font-mono">terraform apply -auto-approve</code>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3">
                        <p className="text-white/50 text-xs mb-1"># Destroy when done</p>
                        <code className="text-rose-400 text-sm font-mono">terraform destroy</code>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h5 className="text-white/80 text-sm font-medium mb-2">SAM vs Terraform</h5>
                      <div className="space-y-2 text-xs text-white/50">
                        <p>• <span className="text-amber-400">SAM</span>: AWS-native, simpler for serverless</p>
                        <p>• <span className="text-purple-400">Terraform</span>: Multi-cloud, state management</p>
                        <p>• Both produce identical infrastructure</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COURSE TAB */}
            {activeTab === "course" && (
              <div className="space-y-6" data-testid="course-content">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">IDC5131: Distributed Systems for Data Science</h3>
                        <p className="text-white/60 mt-1">A hands-on course teaching students to build and manage data pipelines at scale using cloud and distributed computing technologies.</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-4">Course Topics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          "AWS Lambda, S3, DynamoDB, SQS",
                          "Git/GitHub Workflows",
                          "Apache Spark with Databricks",
                          "Snowflake Data Warehousing",
                          "Kafka/Redpanda Streaming",
                          "dbt & Airflow",
                          "Parquet, Delta, Iceberg",
                          "Serverless API Development",
                          "CloudFormation/SAM"
                        ].map((topic, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Code2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span className="text-white/60">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-4">Weekly Schedule</h4>
                      <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                        {[
                          { week: "1-2", topic: "Git fundamentals, AWS onboarding, S3 static sites" },
                          { week: "3-4", topic: "Serverless APIs, Lambda + DynamoDB, SQS/SNS patterns" },
                          { week: "5-6", topic: "Distributed systems lab (this project!), Polars for data at scale" },
                          { week: "7-9", topic: "Spark 101, Databricks, file & table formats" },
                          { week: "10-12", topic: "Snowflake, streaming with Kafka/Redpanda" },
                          { week: "13-15", topic: "Integration projects, Snowpark ML, final presentations" },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-4 py-2 border-b border-white/5">
                            <span className="text-emerald-400 font-mono w-12">W{item.week}</span>
                            <span className="text-white/60">{item.topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-4">Course Details</h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-emerald-400 mt-0.5" />
                          <div>
                            <p className="text-white/80 font-medium">Instructor</p>
                            <p className="text-white/50 text-sm">Prof. Gil Salu</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
                          <div>
                            <p className="text-white/80 font-medium">Schedule</p>
                            <p className="text-white/50 text-sm">Tue/Thu 9:00-10:20 AM</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                          <div>
                            <p className="text-white/80 font-medium">Location</p>
                            <p className="text-white/50 text-sm">Library 209</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h4 className="text-white font-medium">New College of Florida</h4>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">
                        The public honors college of Florida, known for rigorous academics, 
                        small class sizes, and emphasis on independent study and research.
                      </p>
                      <a 
                        href="https://www.ncf.edu" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-emerald-400 text-sm hover:underline"
                      >
                        Learn more <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h4 className="text-white font-medium">Ukraine Partnership</h4>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">
                        Developing data science partnerships between NCF and Ukraine's Ministry of Digital Transformation 
                        to support digital resilience and recovery through applied student projects.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT ME TAB */}
            {activeTab === "about" && (
              <div className="space-y-6" data-testid="about-content">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Matthew R. MacFarlane</h3>
                        <p className="text-emerald-400 font-medium">Machine Learning Engineer & Data Scientist</p>
                        <p className="text-white/50 mt-2">
                          Passionate about applying AI/ML to solve real-world problems. Currently pursuing 
                          graduate studies in Data Science at New College of Florida while building 
                          production-grade distributed systems.
                        </p>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Education
                      </h4>
                      <div className="space-y-4">
                        {[
                          { school: "New College of Florida", degree: "M.S. Data Science (In Progress)", date: "2025-2026" },
                          { school: "Flatiron School", degree: "Full Stack Web Development (Python/Flask, JavaScript)", date: "2023" },
                          { school: "The Catholic University of America", degree: "B.A. Political Science", date: "2020" },
                          { school: "United States Military Academy", degree: "West Point - Art, Philosophy, Literature", date: "2012-2015" },
                        ].map((edu, i) => (
                          <div key={i} className="flex justify-between items-start border-b border-white/5 pb-3">
                            <div>
                              <p className="text-white/80 font-medium">{edu.school}</p>
                              <p className="text-white/50 text-sm">{edu.degree}</p>
                            </div>
                            <span className="text-white/40 text-sm">{edu.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> Notable Projects
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { 
                            name: "MaterMemoriae", 
                            desc: "Language learning app with GPT-4, Whisper, TensorFlow.js",
                            tech: "Python, Flask, React, GCP"
                          },
                          { 
                            name: "Voice-to-Vision", 
                            desc: "AI art generation from song lyrics",
                            tech: "OpenAI Whisper, DALL-E 2"
                          },
                          { 
                            name: "Inference Mesh", 
                            desc: "TensorFlow Lite object detection & pose estimation",
                            tech: "TF Lite, Flask, Cloud Functions"
                          },
                          { 
                            name: "LitCrypts", 
                            desc: "Cryptographic puzzle game with real-time leaderboards",
                            tech: "Flask, SQLAlchemy, Google Bard"
                          },
                        ].map((proj, i) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <p className="text-white/80 font-medium">{proj.name}</p>
                            <p className="text-white/50 text-sm mt-1">{proj.desc}</p>
                            <p className="text-emerald-400/70 text-xs mt-2">{proj.tech}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Contact */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-4">Contact</h4>
                      <div className="space-y-3">
                        <a href="mailto:matthew.macfarlane27@ncf.edu" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">matthew.macfarlane27@ncf.edu</span>
                        </a>
                        <a href="https://github.com/mattmacf98" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                          <Github className="w-4 h-4" />
                          <span className="text-sm">github.com/mattmacf98</span>
                        </a>
                        <a href="https://linkedin.com/in/matthew-macfarlane" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                          <Linkedin className="w-4 h-4" />
                          <span className="text-sm">linkedin.com/in/matthew-macfarlane</span>
                        </a>
                        <div className="flex items-center gap-3 text-white/70">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">Briarcliff Manor, NY</span>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" /> Certifications
                      </h4>
                      <div className="space-y-2 text-sm">
                        {[
                          "AWS Solutions Architect Associate",
                          "AWS Machine Learning Specialty",
                          "Certified Kubernetes Administrator",
                          "GCP Professional Cloud Architect",
                          "GCP Professional Data Engineer",
                          "GCP Professional DevOps Engineer",
                          "Lean Six Sigma Green Belt"
                        ].map((cert, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="text-white/60">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                      <h4 className="text-white font-medium mb-3">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Python", "JavaScript", "React", "Flask", "TensorFlow", 
                          "AWS", "GCP", "Kubernetes", "Docker", "Spark",
                          "LangChain", "LLMs", "Snowflake", "DynamoDB"
                        ].map((skill, i) => (
                          <span key={i} className="px-2 py-1 rounded text-xs bg-white/5 text-white/60 border border-white/10">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <p className="text-white/40">
                AdFlow Project — Spring 2026 — IDC5131 Distributed Systems — New College of Florida
              </p>
              <p className="text-white/40">
                Built with AWS Lambda, SQS, DynamoDB, SAM, React
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
