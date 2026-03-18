import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState("");
  const [page, setPage] = useState("feed");
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  const handlePost = async () => {
    if (!input.trim()) return;

    const content = input.trim();
    setInput("");

    await supabase.from("posts").insert([
      { content, wallet: wallet || "anonymous", likes: 0 },
    ]);

    fetchPosts();
  };

  const handleLike = async (post) => {
    await supabase
      .from("posts")
      .update({ likes: (post.likes ?? 0) + 1 })
      .eq("id", post.id);

    fetchPosts();
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}
      <div className="w-64 p-6 border-r border-white/10">
        <h1 className="text-cyan-400 font-bold mb-6 text-xl">SUPRANET</h1>

        <div className="flex flex-col gap-4">
          <button onClick={() => setPage("feed")}>Feed</button>
          <button onClick={() => setPage("tinyapp")}>
            SuperTinyApp ⚡
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="capitalize">{page}</h2>

          <button
            onClick={connectWallet}
            className="bg-cyan-500 text-black px-4 py-2 rounded"
          >
            {wallet ? wallet.slice(0, 6) + "..." : "Connect Wallet"}
          </button>
        </div>

        {/* FEED */}
        {page === "feed" && (
          <>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's happening?"
              className="w-full p-3 bg-black border border-white/10 rounded"
            />

            <button
              onClick={handlePost}
              className="mt-2 bg-cyan-500 px-4 py-1 rounded text-black"
            >
              Post
            </button>

            <div className="mt-4 space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="p-3 border border-white/10 rounded">
                  <p className="text-gray-300">{post.content}</p>

                  <div className="mt-2 flex gap-4 text-sm">
                    <button onClick={() => handleLike(post)}>
                      ❤️ {post.likes ?? 0}
                    </button>

                    <button>💬</button>
                    <button>🔁</button>
                    <button>⚡</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MINI APP */}
        {page === "tinyapp" && (
          <>
            <input
              type="number"
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 bg-black border border-white/10 rounded"
            />

            <button
              onClick={() => alert(Number(input) * 2)}
              className="mt-2 bg-cyan-500 px-4 py-1 rounded text-black"
            >
              Multiply x2
            </button>
          </>
        )}

      </div>
    </div>
  );
}