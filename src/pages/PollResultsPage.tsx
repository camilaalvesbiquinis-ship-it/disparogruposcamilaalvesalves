import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, ArrowLeft, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface PollAggregate {
  broadcast_id: string;
  option_name: string;
  vote_count: number;
  unique_voters: number;
}

interface BroadcastWithVotes {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  total_groups: number;
  options: { name: string; count: number }[];
  uniqueVoters: number;
  totalVotes: number;
}

const PollResultsPage = () => {
  const navigate = useNavigate();

  const { data: pollBroadcasts = [], isLoading } = useQuery({
    queryKey: ["poll-results"],
    queryFn: async () => {
      const { data: broadcasts, error: bErr } = await supabase
        .from("broadcasts")
        .select("*")
        .eq("content_type", "poll")
        .order("created_at", { ascending: false });
      if (bErr) throw bErr;
      if (!broadcasts || broadcasts.length === 0) return [];

      const { data: agg, error: vErr } = await supabase.rpc("get_poll_results");
      if (vErr) throw vErr;

      const aggregates = (agg || []) as PollAggregate[];

      return broadcasts.map((b) => {
        const rows = aggregates.filter((a) => a.broadcast_id === b.id);
        const options = rows.map((r) => ({ name: r.option_name, count: Number(r.vote_count) }));
        const totalVotes = options.reduce((s, o) => s + o.count, 0);
        const uniqueVoters = rows[0] ? Number(rows[0].unique_voters) : 0;
        return { ...b, options, totalVotes, uniqueVoters } as BroadcastWithVotes;
      });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/messages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Resultados de Enquetes
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe os votos recebidos em tempo real
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pollBroadcasts.length === 0 ? (
          <div className="card-glow rounded-xl p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma enquete enviada ainda
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pollBroadcasts.map((broadcast) => (
              <PollCard key={broadcast.id} broadcast={broadcast} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function PollCard({ broadcast }: { broadcast: BroadcastWithVotes }) {
  const { options, uniqueVoters, totalVotes } = broadcast;
  const sortedOptions = [...options].sort((a, b) => b.count - a.count);
  const maxVotes = sortedOptions.length > 0 ? sortedOptions[0].count : 0;

  return (
    <div className="card-glow rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            {broadcast.content || broadcast.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {format(new Date(broadcast.created_at), "dd/MM/yyyy HH:mm")} •{" "}
            {broadcast.total_groups} grupo(s)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {uniqueVoters} votante(s)
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {totalVotes} voto(s)
          </span>
        </div>
      </div>

      {sortedOptions.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Nenhum voto recebido ainda. Configure o webhook da Z-API para receber votos automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedOptions.map(({ name: option, count }, i) => {
            const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isWinner = count === maxVotes;
            return (
              <div key={option} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={`${isWinner ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {i === 0 && isWinner && "🏆 "}
                    {option}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinner ? "bg-primary" : "bg-primary/40"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PollResultsPage;
