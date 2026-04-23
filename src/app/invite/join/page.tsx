export default function InviteJoinPage() {
  return (
    <div className="mx-auto mt-8 w-full max-w-md rounded-2xl bg-white p-4 shadow-sm">
      <h1 className="text-lg font-bold text-slate-900">家族として参加</h1>
      <p className="mt-2 text-sm text-slate-600">
        招待コードを入力して、ペット情報の共同編集に参加します。
      </p>
      <form className="mt-4 space-y-3">
        <input
          type="text"
          name="inviteCode"
          placeholder="招待コード"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <button type="button" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          参加する
        </button>
      </form>
    </div>
  );
}
