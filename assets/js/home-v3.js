export function resolveInventoryItem(items, id) { if (!Array.isArray(items) || items.length === 0) return null; return items.find((item) => item.id === id) || items[0]; }
export function nextInventoryIndex(current, key, count) { if (count < 1) return -1; if (key === "Home") return 0; if (key === "End") return count - 1; if (key === "ArrowRight" || key === "ArrowDown") return (current + 1) % count; if (key === "ArrowLeft" || key === "ArrowUp") return (current - 1 + count) % count; return current; }
export function nextEnabledInventoryIndex(current, key, disabled) {
  if (!Array.isArray(disabled) || disabled.length === 0) return -1;
  const enabled = disabled.map((value, index) => value ? -1 : index).filter((index) => index >= 0);
  if (enabled.length === 0) return -1;
  if (key === "Home") return enabled[0];
  if (key === "End") return enabled[enabled.length - 1];
  const direction = key === "ArrowRight" || key === "ArrowDown" ? 1 : key === "ArrowLeft" || key === "ArrowUp" ? -1 : 0;
  if (direction === 0) return current;
  let candidate = current;
  for (let step = 0; step < disabled.length; step += 1) {
    candidate = (candidate + direction + disabled.length) % disabled.length;
    if (!disabled[candidate]) return candidate;
  }
  return current;
}
function dataFromButton(button) { return { id:button.dataset.appId, title:button.dataset.appTitle, copy:button.dataset.appCopy, href:button.dataset.appHref, linkLabel:button.dataset.appLinkLabel, status:button.dataset.appStatus }; }
export function initInventory(root = document) {
  const dock=root.querySelector("[data-inventory-dock]"), detail=root.querySelector("[data-inventory-detail]"); if (!dock || !detail) return;
  const buttons=[...dock.querySelectorAll("[data-inventory-tab]")], items=buttons.map(dataFromButton);
  function activate(button, moveFocus) { const item=resolveInventoryItem(items,button.dataset.appId); if (!item) return; buttons.forEach((entry)=>{const selected=entry===button; entry.setAttribute("aria-selected",String(selected)); entry.tabIndex=selected?0:-1;}); detail.querySelector("[data-inventory-title]").textContent=item.title; detail.querySelector("[data-inventory-copy]").textContent=item.copy; detail.querySelector("[data-inventory-status]").textContent=item.status; const link=detail.querySelector("[data-inventory-link]"); link.href=item.href; link.textContent=item.linkLabel; if(moveFocus) button.focus(); }
  dock.addEventListener("click",(event)=>{const button=event.target.closest("[data-inventory-tab]"); if(button && !button.disabled) activate(button,false);});
  dock.addEventListener("keydown",(event)=>{const current=buttons.indexOf(event.target.closest("[data-inventory-tab]")); if(current<0)return; const next=nextEnabledInventoryIndex(current,event.key,buttons.map((button)=>button.disabled)); if(next===current || next<0)return; event.preventDefault(); activate(buttons[next],true);});
}
if (typeof document !== "undefined") initInventory(document);
