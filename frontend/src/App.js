import { useState } from "react";
import "@/App.css";
import { Github, Linkedin, Mail, ExternalLink, Server, Database, Cloud, Zap, BarChart3, Code2, GraduationCap, MapPin, Calendar, BookOpen, Award } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("project");

  return (
    <div className="App min-h-screen bg-[#0a0a0b]">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/40">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" data-testid="header-name">
                  Matthew R. MacFarlane
                </h1>
                <p className="text-emerald-400 font-mono text-sm mt-1">Data Science & Distributed Systems</p>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                   className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-105" data-testid="github-link">
                  <Github className="w-5 h-5 text-white/80" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-105" data-testid="linkedin-link">
                  <Linkedin className="w-5 h-5 text-white/80" />
                </a>
                <a href="mailto:matthew.macfarlane@ncf.edu"
                   className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all hover:scale-105" data-testid="email-link">
                  <Mail className="w-5 h-5 text-white/80" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-medium">Spring 2026 Project</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6" data-testid="project-title">
                  AdFlow<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Real-Time Bid Engine
                  </span>
                </h2>
                <p className="text-lg text-white/60 leading-relaxed mb-8">
                  A serverless, distributed ad selection pipeline processing live auction streams 
                  at scale using AWS Lambda, SQS, and DynamoDB.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">AWS Lambda</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">SQS</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">DynamoDB</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Python</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">SAM</span>
                </div>
              </div>
              
              {/* Architecture Diagram */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-3xl" />
                <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                  <h3 className="text-white/80 font-medium mb-4 text-sm uppercase tracking-wider">System Architecture</h3>
                  <div className="space-y-4">
                    {/* Architecture flow */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Server className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
                      <span className="text-white/60 text-sm">SQS Input Queue</span>
                    </div>
                    <div className="flex items-center gap-3 pl-6">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
                      <span className="text-white/60 text-sm">Lambda Bid Engine</span>
                    </div>
                    <div className="flex items-center gap-3 pl-12">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Database className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
                      <span className="text-white/60 text-sm">DynamoDB Results</span>
                    </div>
                    <div className="flex items-center gap-3 pl-6">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                      <span className="text-white/60 text-sm">Analytics Pipeline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex gap-1 pt-4">
              {[
                { id: "project", label: "Project Details" },
                { id: "course", label: "Course Info" },
                { id: "skills", label: "Skills & Tech" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white border-t border-x border-white/10"
                      : "text-white/50 hover:text-white/80"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="bg-white/[0.02] border-t border-white/10 py-12">
          <div className="max-w-6xl mx-auto px-6">
            {/* Project Details Tab */}
            {activeTab === "project" && (
              <div className="grid md:grid-cols-2 gap-8" data-testid="project-content">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">The Challenge</h3>
                  <p className="text-white/60 leading-relaxed">
                    Every time you see an online ad, a distributed computing event happens in under 100 milliseconds. 
                    The platform must evaluate thousands of competing advertisers, rank them by quality-adjusted scores, 
                    and return a winner before the page loads.
                  </p>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                    <h4 className="text-emerald-400 font-mono text-sm mb-2">Scoring Formula</h4>
                    <code className="text-white/80 text-sm">
                      score = bid_amount × relevance × time_bonus × device_bonus
                    </code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white pt-4">Key Features</h3>
                  <ul className="space-y-3">
                    {[
                      "Quality-adjusted bidding with contextual relevance multipliers",
                      "Parallel I/O with ThreadPoolExecutor for optimal latency",
                      "Batch DynamoDB writes reducing API calls by 90%",
                      "Fault-tolerant batch processing with partial failure reporting",
                      "Real-time performance monitoring via CloudWatch"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        <span className="text-white/60">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Performance Optimizations</h3>
                  <div className="grid gap-4">
                    {[
                      { label: "Cold Start", before: "~500ms", after: "~200ms", improvement: "60%" },
                      { label: "Batch Processing", before: "600ms", after: "15ms", improvement: "97%" },
                      { label: "DynamoDB Writes", before: "Individual", after: "Batched", improvement: "90% fewer calls" },
                      { label: "Memory", before: "256MB", after: "512MB", improvement: "2x CPU" },
                    ].map((metric, i) => (
                      <div key={i} className="bg-black/40 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{metric.label}</span>
                          <span className="text-emerald-400 text-sm font-mono">{metric.improvement}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/40">{metric.before}</span>
                          <span className="text-white/20">→</span>
                          <span className="text-white/60">{metric.after}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Course Info Tab */}
            {activeTab === "course" && (
              <div className="grid md:grid-cols-3 gap-8" data-testid="course-content">
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">IDC5131: Distributed Systems for Data Science</h3>
                      <p className="text-white/60 mt-1">A hands-on course teaching students to build and manage data pipelines at scale using cloud and distributed computing technologies.</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                    <h4 className="text-white font-medium mb-4">Course Topics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "AWS Lambda, S3, DynamoDB, SQS",
                        "Git/GitHub Workflows",
                        "Apache Spark with Databricks",
                        "Snowflake Data Warehousing",
                        "Kafka Streaming",
                        "dbt & Airflow",
                        "Parquet, Delta, Iceberg Formats",
                        "Serverless API Development"
                      ].map((topic, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-cyan-400" />
                          <span className="text-white/60 text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                    <h4 className="text-white font-medium mb-4">Weekly Schedule Highlights</h4>
                    <div className="space-y-3 text-sm">
                      {[
                        { week: "1-2", topic: "Git fundamentals, AWS onboarding, S3 static sites" },
                        { week: "3-4", topic: "Serverless APIs, Lambda + DynamoDB, SQS/SNS patterns" },
                        { week: "5-6", topic: "Distributed systems lab, Polars for data at scale" },
                        { week: "7-9", topic: "Spark 101, Databricks, file & table formats" },
                        { week: "10-12", topic: "Snowflake, streaming with Kafka/Redpanda" },
                        { week: "13-15", topic: "Integration projects, Snowpark ML, final presentations" },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-emerald-400 font-mono w-12">W{item.week}</span>
                          <span className="text-white/60">{item.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
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
                  
                  <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-5 h-5 text-amber-400" />
                      <h4 className="text-white font-medium">New College of Florida</h4>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">
                      The public honors college of Florida, known for its rigorous academics, 
                      small class sizes, and emphasis on independent study and research.
                    </p>
                    <a 
                      href="https://www.ncf.edu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-emerald-400 text-sm hover:underline"
                    >
                      Learn more <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="grid md:grid-cols-3 gap-8" data-testid="skills-content">
                {[
                  {
                    title: "Cloud & Infrastructure",
                    icon: Cloud,
                    color: "amber",
                    skills: ["AWS Lambda", "Amazon SQS", "DynamoDB", "S3", "CloudFormation/SAM", "CloudWatch", "IAM"]
                  },
                  {
                    title: "Data Engineering",
                    icon: Database,
                    color: "cyan",
                    skills: ["Apache Spark", "Databricks", "Snowflake", "Kafka/Redpanda", "dbt", "Airflow", "Parquet/Delta/Iceberg"]
                  },
                  {
                    title: "Development",
                    icon: Code2,
                    color: "emerald",
                    skills: ["Python", "SQL", "Git/GitHub", "REST APIs", "Serverless", "Distributed Systems", "Performance Optimization"]
                  }
                ].map((category, i) => (
                  <div key={i} className="bg-black/40 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg bg-${category.color}-500/20 flex items-center justify-center`}>
                        <category.icon className={`w-5 h-5 text-${category.color}-400`} />
                      </div>
                      <h3 className="text-white font-medium">{category.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, j) => (
                        <span 
                          key={j}
                          className="px-2 py-1 rounded text-xs font-medium bg-white/5 text-white/70 border border-white/10"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-sm">
                AdFlow Project — Spring 2026 — New College of Florida
              </p>
              <p className="text-white/40 text-sm">
                Built with AWS Lambda, SQS, DynamoDB, and Python
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
