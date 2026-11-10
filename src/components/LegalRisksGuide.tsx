import React from 'react';
import { ShieldAlert, AlertTriangle, BookOpen, Scale, FileText, CheckCircle2, Download, Info } from 'lucide-react';

export const LegalRisksGuide: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* Hero Warning Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              上市發行人法規遵循與責任警示
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">
              臺灣證券法規申報時限與處罰防呆指引
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              依據證券交易法、公司法及臺灣證券交易所各項作業辦法，公開資訊觀測站(MOPS)之資訊申報屬於法定公權力監管範疇。
              逾期申報、虛偽隱匿或程序瑕疵，不僅將面臨高額違約金與罰鍰，最嚴重將導致變更交易方法甚至停止買賣！
            </p>
          </div>

          <a
            href="/assets/aistudio/_______11504_____1cacbb13.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap self-start shadow-sm"
          >
            <Download className="w-4 h-4" />
            下載證交所官方 PDF (143頁)
          </a>
        </div>
      </div>

      {/* Grid: Penalties breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Securities and Exchange Act */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              證券交易法法定裁罰標準 (行政處分)
            </h3>
          </div>
          <ul className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <li className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-900/40">
              <div className="font-bold text-rose-700 dark:text-rose-400 mb-1">
                證交法第 178 條：處新臺幣 24 萬至 480 萬元罰鍰
              </div>
              <p>
                發行人未依第36條規定如期公告申報財務報告、月營業額資訊，或未依第25條申報內部人股權異動，主管機關得處負責人新臺幣24萬元以上480萬元以下罰鍰，並得命其限期辦理；屆期仍不辦理者，得按次處罰。
              </p>
            </li>

            <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white mb-1">
                證交法第 179 條：處罰法人之負責人「個人」
              </div>
              <p>
                法人違反本法之規定者，除依法處罰法人外，並處罰為此行為之負責人！因此董監持股申報不實或財報延誤，裁罰受處分人往往直接開罰董事長或內部人個人。
              </p>
            </li>

            <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white mb-1">
                證交法第 43 條之 1：大量持股 5% 申報新規
              </div>
              <p>
                大股東持股申報門檻自113年5月起由10%降至5%。任何人初次取得超過5%或每變動1%時，未於10日內/2日內申報，金管會依法處24萬至480萬元罰鍰。
              </p>
            </li>
          </ul>
        </div>

        {/* TWSE Rules & Market sanctions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              臺灣證券交易所規章處置 (市場監管)
            </h3>
          </div>
          <ul className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <li className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/40">
              <div className="font-bold text-amber-700 dark:text-amber-400 mb-1">
                重大訊息延遲／未澄清違約金：3 萬至 500 萬元
              </div>
              <p>
                未於事實發生次一營業日開盤前2小時發布重大訊息、或媒體報導後未於2小時內澄清，證交所每次處以違約金新臺幣3萬元至500萬元；若影響市場重大者，得變更交易方法或停止買賣。
              </p>
            </li>

            <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white mb-1">
                營業細則第 50 條：財務報告逾期停止買賣與終止上市
              </div>
              <p>
                若未能在法定截止日（年報3/31、季報5/15、8/14、11/14）申報經會計師查核核閱之財務報告，證交所於公告次二營業日起即刻「停止買賣」；停止買賣屆滿六個月仍未補正者，終止上市！
              </p>
            </li>

            <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white mb-1">
                公司治理評鑑重大違規扣分機制
              </div>
              <p>
                年報或議事手冊逾期上傳、內部控制聲明書申報瑕疵、法說會未達法定場次等情事，將直接在公司治理評鑑扣總分或降級處置，嚴重打擊機構法人投資信心。
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Golden Rules Checklist */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            上市發行人實務防呆 · 6 大關鍵黃金守則
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
              1. 開盤前 2 小時鐵律 (07:00 前)
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              董事會決議重大財務業務（股利、財報、私募、併購、停復牌）之次一營業日，務必於交易時間開始二小時前（上午7:00前）於觀測站完成重大訊息公告。
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
              2. 媒體澄清 2 小時限時原則
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              大眾傳播媒體報導重大訊息或與事實不符時，至遲不得逾發現後 2 小時內澄清；接獲證交所電話或傳真詢問時，營業日下午 5 時前接獲者亦必須在 2 小時內發布重訊說明。
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
              3. 停止過戶前「12 個營業日」原則
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              股東常會、股東臨時會、除權除息之停止股票過戶公告，法定計算基準為「至少 12 個營業日」（扣除週六、週日與國定假日），算錯天數公告無效，股東會將被迫延期。
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
              4. 電子書「文字轉 PDF」禁掃描原則
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              年度財報、季報、年報、議事手冊上傳公開資訊觀測站時，除會計師核閱簽章頁外，內容必須以原始文字檔直接轉為 PDF 上傳，嚴格禁止將整本紙本掃描成圖片檔上傳。
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
              5. 內部人事前申報 3 日原則
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              董監經理人及大股東在市場轉讓股票超過一萬股（10張）者，必須於轉讓日 3 日前向金管會申報並於當日 17:30 前輸入觀測站。未事前申報即拋售將直接面臨個人裁罰。
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
              6. 自願申報「全年持續」原則
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              公司若自願在公開資訊觀測站公告「自結損益」或「產品營收統計表」，依規定一旦開始公告，必須「持續公告至該會計年度結束為止」，不可隨意終止或挑選月份申報。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
