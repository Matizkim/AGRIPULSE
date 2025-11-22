import React from "react";

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">Welcome to AgriPulse</h2>
          <p className="mt-3 text-slate-600">Fast market matching for farmers and buyers. Post what you have, or post what you need — get notified in realtime.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">How it works</h3>
            <ol className="mt-2 text-sm text-slate-600 list-decimal ml-5">
              <li>Farmers post produce listings.</li>
              <li>Buyers post demands.</li>
              <li>Matches are proposed and confirmed; drivers can join transport pools.</li>
            </ol>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Get started</h3>
            <p className="mt-2 text-sm text-slate-600">Use the top menu to create produce or demand posts. Use SMS page to test notifications (dev sandbox).</p>
          </div>
        </div>
      </div>

      <aside>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold">Quick actions</h4>
          <div className="mt-3 flex flex-col gap-2">
            <a href="/produce" className="block px-3 py-2 bg-green-600 text-white rounded text-center">Post produce</a>
            <a href="/demand" className="block px-3 py-2 border rounded text-center">Post demand</a>
          </div>
        </div>
      </aside>
    </div>
  );
}
