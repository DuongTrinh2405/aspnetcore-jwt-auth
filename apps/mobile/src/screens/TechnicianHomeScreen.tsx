import {
  JOB_PRIORITY_LABELS,
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  type CurrentUserProfile,
  type Job,
  type JobStatus
} from "@cnl/shared";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  acceptJob,
  fetchAssignedJobs,
  fetchAvailableJobs,
  primeAssignedJobs,
  primeAvailableJobs,
  updateAssignedJobStatus
} from "../services/technician";

type TechnicianHomeScreenProps = {
  profile: CurrentUserProfile;
  onSignOut: () => void;
};

type TabKey = "home" | "feed" | "mine" | "profile";

export function TechnicianHomeScreen({ profile, onSignOut }: TechnicianHomeScreenProps) {
  const [tab, setTab] = useState<TabKey>("home");
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadJobs() {
    setLoading(true);
    try {
      const [available, assigned] = await Promise.all([
        fetchAvailableJobs(),
        fetchAssignedJobs()
      ]);
      setAvailableJobs(available);
      setAssignedJobs(assigned);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleAccept(jobId: string) {
    const targetJob = availableJobs.find((job) => job.id === jobId);
    const previousAvailable = availableJobs;
    const previousAssigned = assignedJobs;

    setBusyJobId(jobId);
    setMessage("");
    setTab("mine");

    if (targetJob) {
      const optimisticJob: Job = {
        ...targetJob,
        assigned_technician_id: profile.id,
        status: "accepted",
        updated_at: new Date().toISOString()
      };
      const nextAvailable = previousAvailable.filter((job) => job.id !== jobId);
      const nextAssigned = [optimisticJob, ...previousAssigned.filter((job) => job.id !== jobId)];
      setAvailableJobs(nextAvailable);
      setAssignedJobs(nextAssigned);
      primeAvailableJobs(nextAvailable);
      primeAssignedJobs(nextAssigned);
    }

    try {
      const accepted = await acceptJob(jobId);
      setAssignedJobs((current) => current.map((job) => (job.id === jobId ? accepted : job)));
      await loadJobs();
    } catch (error) {
      setAvailableJobs(previousAvailable);
      setAssignedJobs(previousAssigned);
      primeAvailableJobs(previousAvailable);
      primeAssignedJobs(previousAssigned);
      setTab("feed");
      setMessage(error instanceof Error ? error.message : "Không nhận được job.");
    } finally {
      setBusyJobId(null);
    }
  }

  async function handleStatus(jobId: string, nextStatus: JobStatus) {
    const previousAssigned = assignedJobs;
    const now = new Date().toISOString();
    const nextAssigned = previousAssigned.map((job) =>
      job.id === jobId ? { ...job, status: nextStatus, updated_at: now } : job
    );

    setBusyJobId(jobId);
    setMessage("");
    setAssignedJobs(nextAssigned);
    primeAssignedJobs(nextAssigned);

    try {
      const updated = await updateAssignedJobStatus(jobId, nextStatus);
      setAssignedJobs((current) => current.map((job) => (job.id === jobId ? updated : job)));
    } catch (error) {
      setAssignedJobs(previousAssigned);
      primeAssignedJobs(previousAssigned);
      setMessage(error instanceof Error ? error.message : "Không cập nhật được trạng thái.");
    } finally {
      setBusyJobId(null);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>CNL Technician</Text>
          <Text style={styles.title}>Xin chào, {profile.fullName || "kỹ thuật viên"}</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>
      </View>

      {message ? <Text style={styles.errorBanner}>{message}</Text> : null}

      {tab === "home" ? (
        <TechnicianDashboard
          assignedJobs={assignedJobs}
          availableJobs={availableJobs}
          loading={loading}
          profile={profile}
          setTab={setTab}
        />
      ) : null}
      {tab === "feed" ? (
        <JobList
          busyJobId={busyJobId}
          emptyText="Chưa có job phù hợp. RLS có thể đang lọc job VIP."
          jobs={availableJobs}
          loading={loading}
          mode="available"
          onAccept={handleAccept}
          onRefresh={loadJobs}
          onStatus={handleStatus}
        />
      ) : null}
      {tab === "mine" ? (
        <JobList
          busyJobId={busyJobId}
          emptyText="Bạn chưa nhận job nào."
          jobs={assignedJobs}
          loading={loading}
          mode="assigned"
          onAccept={handleAccept}
          onRefresh={loadJobs}
          onStatus={handleStatus}
        />
      ) : null}
      {tab === "profile" ? <TechnicianProfile profile={profile} onSignOut={onSignOut} /> : null}

      <View style={styles.tabBar}>
        {[
          ["home", "Tổng quan"],
          ["feed", "Job feed"],
          ["mine", "Của tôi"],
          ["profile", "Hồ sơ"]
        ].map(([key, label]) => (
          <Pressable key={key} style={[styles.tabItem, tab === key && styles.tabItemActive]} onPress={() => setTab(key as TabKey)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function TechnicianDashboard({
  profile,
  availableJobs,
  assignedJobs,
  loading,
  setTab
}: {
  profile: CurrentUserProfile;
  availableJobs: Job[];
  assignedJobs: Job[];
  loading: boolean;
  setTab: (tab: TabKey) => void;
}) {
  const activeJobs = useMemo(
    () => assignedJobs.filter((job) => job.status === "accepted" || job.status === "in_progress"),
    [assignedJobs]
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroBadge}>{profile.role === "technician_vip" ? "VIP technician" : "Regular technician"}</Text>
        <Text style={styles.heroTitle}>Nhận job phù hợp, cập nhật tiến độ tại hiện trường.</Text>
        <Text style={styles.heroText}>Job VIP chỉ xuất hiện với nhân viên VIP. Mọi thao tác nhận job đều qua RPC an toàn.</Text>
        <Pressable style={styles.whiteButton} onPress={() => setTab("feed")}>
          <Text style={styles.whiteButtonText}>Mở job feed</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <MetricCard label="Có thể nhận" value={loading ? "..." : String(availableJobs.length)} />
        <MetricCard label="Đang làm" value={loading ? "..." : String(activeJobs.length)} />
        <MetricCard label="Đã nhận" value={loading ? "..." : String(assignedJobs.length)} />
      </View>

      <Text style={styles.sectionTitle}>Job đang phụ trách</Text>
      {assignedJobs.slice(0, 3).map((job) => <MobileTechJobCard key={job.id} job={job} mode="readonly" />)}
      {!loading && assignedJobs.length === 0 ? <EmptyState text="Chưa nhận job nào. Mở job feed để bắt đầu." /> : null}
    </ScrollView>
  );
}

function JobList({
  jobs,
  loading,
  mode,
  busyJobId,
  emptyText,
  onRefresh,
  onAccept,
  onStatus
}: {
  jobs: Job[];
  loading: boolean;
  mode: "available" | "assigned";
  busyJobId: string | null;
  emptyText: string;
  onRefresh: () => void;
  onAccept: (jobId: string) => void;
  onStatus: (jobId: string, status: JobStatus) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>{mode === "available" ? "Job có thể nhận" : "Job của tôi"}</Text>
        <Pressable style={styles.smallButton} onPress={onRefresh}><Text style={styles.smallButtonText}>Làm mới</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color="#0F4C81" /> : jobs.map((job) => (
        <MobileTechJobCard
          key={job.id}
          busy={busyJobId === job.id}
          job={job}
          mode={mode}
          onAccept={() => onAccept(job.id)}
          onStatus={(status) => onStatus(job.id, status)}
        />
      ))}
      {!loading && jobs.length === 0 ? <EmptyState text={emptyText} /> : null}
    </ScrollView>
  );
}

function TechnicianProfile({ profile, onSignOut }: TechnicianHomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hồ sơ nhân viên</Text>
        <Text style={styles.profileName}>{profile.fullName}</Text>
        <Text style={styles.muted}>{profile.email}</Text>
        <Text style={styles.muted}>{profile.role}</Text>
        <Pressable style={styles.outlineButton} onPress={onSignOut}><Text style={styles.outlineText}>Đăng xuất</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function MobileTechJobCard({
  job,
  mode,
  busy,
  onAccept,
  onStatus
}: {
  job: Job;
  mode: "available" | "assigned" | "readonly";
  busy?: boolean;
  onAccept?: () => void;
  onStatus?: (status: JobStatus) => void;
}) {
  return (
    <View style={styles.jobCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.serviceLabel}>{SERVICE_TYPE_LABELS[job.service_type]}</Text>
        <Text style={styles.statusPill}>{JOB_STATUS_LABELS[job.status]}</Text>
      </View>
      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.jobText}>{job.address}</Text>
      <Text style={styles.jobText}>{job.phone}</Text>
      <Text style={styles.priorityText}>{JOB_PRIORITY_LABELS[job.priority]} {job.is_vip ? "• VIP" : ""}</Text>

      {mode === "available" ? (
        <Pressable style={styles.primaryButton} disabled={busy} onPress={onAccept}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Nhận job</Text>}
        </Pressable>
      ) : null}

      {mode === "assigned" && job.status === "accepted" ? (
        <Pressable style={styles.primaryButton} disabled={busy} onPress={() => onStatus?.("in_progress")}>
          <Text style={styles.primaryButtonText}>Bắt đầu xử lý</Text>
        </Pressable>
      ) : null}

      {mode === "assigned" && job.status === "in_progress" ? (
        <Pressable style={styles.primaryButton} disabled={busy} onPress={() => onStatus?.("completed")}>
          <Text style={styles.primaryButtonText}>Hoàn thành</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F8FB" },
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kicker: { color: "#0F4C81", fontWeight: "900", letterSpacing: 0 },
  title: { marginTop: 4, fontSize: 24, lineHeight: 31, fontWeight: "900", color: "#0F172A" },
  avatar: { width: 46, height: 46, borderRadius: 18, backgroundColor: "#0F4C81", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  content: { padding: 22, paddingBottom: 110 },
  heroCard: { borderRadius: 28, backgroundColor: "#0F4C81", padding: 24, shadowColor: "#0F4C81", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.24, shadowRadius: 28, elevation: 8 },
  heroBadge: { color: "#A5F3FC", fontWeight: "900", textTransform: "uppercase", fontSize: 12 },
  heroTitle: { marginTop: 14, color: "#fff", fontSize: 29, lineHeight: 36, fontWeight: "900" },
  heroText: { marginTop: 10, color: "#DBEAFE", lineHeight: 22, fontSize: 15 },
  whiteButton: { marginTop: 18, minHeight: 52, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  whiteButtonText: { color: "#0F4C81", fontWeight: "900", fontSize: 16 },
  primaryButton: { marginTop: 16, minHeight: 50, borderRadius: 16, backgroundColor: "#0F4C81", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  primaryButtonText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  statsGrid: { marginTop: 18, flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, borderRadius: 20, backgroundColor: "#fff", padding: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  metricLabel: { color: "#64748B", fontWeight: "800", fontSize: 12 },
  metricValue: { marginTop: 8, color: "#0F172A", fontWeight: "900", fontSize: 25 },
  sectionTitle: { fontSize: 25, lineHeight: 31, fontWeight: "900", color: "#0F172A" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  jobCard: { marginTop: 12, borderRadius: 22, backgroundColor: "#fff", padding: 17, borderWidth: 1, borderColor: "#E2E8F0" },
  serviceLabel: { color: "#0F4C81", fontWeight: "900", fontSize: 12, textTransform: "uppercase" },
  statusPill: { overflow: "hidden", borderRadius: 999, backgroundColor: "#ECFEFF", color: "#0E7490", paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "900" },
  jobTitle: { marginTop: 12, color: "#0F172A", fontWeight: "900", fontSize: 18 },
  jobText: { marginTop: 6, color: "#64748B", lineHeight: 20 },
  priorityText: { marginTop: 10, color: "#0F172A", fontWeight: "800" },
  emptyState: { marginTop: 16, borderRadius: 22, backgroundColor: "#fff", padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  emptyText: { color: "#64748B", fontWeight: "700", textAlign: "center" },
  smallButton: { borderRadius: 999, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "#fff" },
  smallButtonText: { color: "#0F4C81", fontWeight: "900" },
  card: { borderRadius: 26, backgroundColor: "#fff", padding: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  profileName: { marginTop: 12, fontSize: 24, fontWeight: "900", color: "#0F172A" },
  muted: { marginTop: 7, color: "#64748B", fontWeight: "700" },
  outlineButton: { marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: "#0F4C81", paddingVertical: 14, alignItems: "center" },
  outlineText: { color: "#0F4C81", fontWeight: "900" },
  errorBanner: { marginHorizontal: 22, marginBottom: 8, borderRadius: 16, backgroundColor: "#FEF2F2", color: "#B91C1C", padding: 12, fontWeight: "800" },
  tabBar: { position: "absolute", left: 16, right: 16, bottom: 14, flexDirection: "row", borderRadius: 24, backgroundColor: "#fff", padding: 7, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.14, shadowRadius: 26, elevation: 8 },
  tabItem: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  tabItemActive: { backgroundColor: "#0F4C81" },
  tabText: { color: "#64748B", fontSize: 12, fontWeight: "900" },
  tabTextActive: { color: "#fff" }
});
