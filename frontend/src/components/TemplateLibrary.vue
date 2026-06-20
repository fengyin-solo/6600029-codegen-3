<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDroneStore } from '../store/drone';
import type { TaskTemplate } from '../types';

const store = useDroneStore();

const showSaveDialog = ref(false);
const showLibrary = ref(false);
const activeCategory = ref<TaskTemplate['category'] | 'all'>('all');
const newTemplateName = ref('');
const newTemplateDesc = ref('');
const newTemplateCategory = ref<TaskTemplate['category']>('other');
const editingId = ref<string | null>(null);
const editingName = ref('');
const editingDesc = ref('');
const editingCategory = ref<TaskTemplate['category']>('other');

const categories: { key: TaskTemplate['category'] | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'power', label: '电力巡检', icon: '⚡' },
  { key: 'agriculture', label: '农业植保', icon: '🌾' },
  { key: 'survey', label: '测绘勘察', icon: '🗺️' },
  { key: 'security', label: '安防巡逻', icon: '🛡️' },
  { key: 'other', label: '其他', icon: '📌' },
];

const categoryMeta: Record<TaskTemplate['category'], { label: string; icon: string; color: string }> = {
  power: { label: '电力巡检', icon: '⚡', color: 'text-yellow-400' },
  agriculture: { label: '农业植保', icon: '🌾', color: 'text-green-400' },
  survey: { label: '测绘勘察', icon: '🗺️', color: 'text-blue-400' },
  security: { label: '安防巡逻', icon: '🛡️', color: 'text-red-400' },
  other: { label: '其他', icon: '📌', color: 'text-slate-400' },
};

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') return store.getTemplatesByCategory();
  return store.getTemplatesByCategory(activeCategory.value);
});

function openSaveDialog() {
  if (store.waypoints.length < 2) {
    alert('请先设置至少 2 个航点后再保存模板');
    return;
  }
  newTemplateName.value = '';
  newTemplateDesc.value = '';
  newTemplateCategory.value = 'other';
  showSaveDialog.value = true;
}

function handleSave() {
  if (!newTemplateName.value.trim()) {
    alert('请输入模板名称');
    return;
  }
  store.saveTemplate(
    newTemplateName.value.trim(),
    newTemplateDesc.value.trim() || undefined,
    newTemplateCategory.value
  );
  showSaveDialog.value = false;
  alert('模板已保存 ✓');
}

function handleLoad(id: string) {
  if (store.loadTemplate(id)) {
    alert('模板已加载，可在此基础上调整航线');
  }
}

function handleDelete(id: string, name: string) {
  if (confirm(`确定删除模板"${name}"吗？此操作不可撤销。`)) {
    store.deleteTemplate(id);
  }
}

function startEdit(tpl: TaskTemplate) {
  editingId.value = tpl.id;
  editingName.value = tpl.name;
  editingDesc.value = tpl.description || '';
  editingCategory.value = tpl.category;
}

function cancelEdit() {
  editingId.value = null;
}

function saveEdit() {
  if (!editingId.value) return;
  if (!editingName.value.trim()) {
    alert('请输入模板名称');
    return;
  }
  store.updateTemplate(editingId.value, {
    name: editingName.value.trim(),
    description: editingDesc.value.trim() || undefined,
    category: editingCategory.value,
  });
  editingId.value = null;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
}
</script>

<template>
  <div class="bg-slate-800 rounded-lg p-3">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs font-semibold text-slate-300">📚 任务模板库</h3>
      <div class="flex gap-1">
        <button
          @click="openSaveDialog"
          class="px-2 py-1 rounded text-[10px] font-medium bg-emerald-700 text-white hover:bg-emerald-600 transition"
        >
          💾 保存为模板
        </button>
        <button
          @click="showLibrary = !showLibrary"
          class="px-2 py-1 rounded text-[10px] font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
        >
          {{ showLibrary ? '收起' : '展开' }}
        </button>
      </div>
    </div>

    <div v-if="showLibrary" class="space-y-2">
      <div class="flex flex-wrap gap-1">
        <button
          v-for="cat in categories"
          :key="cat.key"
          @click="activeCategory = cat.key"
          :class="[
            'px-2 py-1 rounded text-[10px] font-medium transition',
            activeCategory === cat.key
              ? 'bg-sky-700 text-white'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600',
          ]"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>

      <div v-if="filteredTemplates.length === 0" class="text-xs text-slate-500 text-center py-4 bg-slate-900 rounded">
        暂无模板，点击"保存为模板"创建
      </div>

      <div v-else class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="bg-slate-900 rounded p-2 border border-slate-700"
        >
          <template v-if="editingId === tpl.id">
            <div class="space-y-1.5">
              <input
                v-model="editingName"
                type="text"
                placeholder="模板名称"
                class="w-full px-2 py-1 rounded text-xs bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <input
                v-model="editingDesc"
                type="text"
                placeholder="描述（可选）"
                class="w-full px-2 py-1 rounded text-xs bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <select
                v-model="editingCategory"
                class="w-full px-2 py-1 rounded text-xs bg-slate-800 border border-slate-600 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="power">⚡ 电力巡检</option>
                <option value="agriculture">🌾 农业植保</option>
                <option value="survey">🗺️ 测绘勘察</option>
                <option value="security">🛡️ 安防巡逻</option>
                <option value="other">📌 其他</option>
              </select>
              <div class="flex gap-1">
                <button
                  @click="saveEdit"
                  class="flex-1 px-2 py-1 rounded text-[10px] font-medium bg-sky-700 text-white hover:bg-sky-600 transition"
                >
                  保存
                </button>
                <button
                  @click="cancelEdit"
                  class="flex-1 px-2 py-1 rounded text-[10px] font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
                >
                  取消
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1">
                  <span class="text-sm" :class="categoryMeta[tpl.category].color">
                    {{ categoryMeta[tpl.category].icon }}
                  </span>
                  <span class="text-xs font-medium text-slate-100 truncate">{{ tpl.name }}</span>
                </div>
                <div v-if="tpl.description" class="text-[10px] text-slate-500 truncate mt-0.5">
                  {{ tpl.description }}
                </div>
                <div class="text-[10px] text-slate-500 mt-1 flex gap-2">
                  <span>{{ tpl.waypoints.length }} 航点</span>
                  <span>{{ tpl.defaultAltitude }}m</span>
                  <span>{{ tpl.defaultSpeed }}m/s</span>
                  <span>{{ formatDate(tpl.updatedAt) }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1 shrink-0">
                <button
                  @click="handleLoad(tpl.id)"
                  class="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-700 text-white hover:bg-sky-600 transition"
                  title="加载模板"
                >
                  加载
                </button>
                <button
                  @click="startEdit(tpl)"
                  class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
                  title="编辑"
                >
                  编辑
                </button>
                <button
                  @click="handleDelete(tpl.id, tpl.name)"
                  class="px-2 py-0.5 rounded text-[10px] font-medium bg-red-900 text-red-200 hover:bg-red-800 transition"
                  title="删除"
                >
                  删除
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="showSaveDialog" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div class="bg-slate-800 rounded-lg p-4 w-full max-w-sm border border-slate-700 shadow-xl">
        <h4 class="text-sm font-bold text-slate-100 mb-3">💾 保存为任务模板</h4>
        <div class="space-y-2">
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">模板名称 *</label>
            <input
              v-model="newTemplateName"
              type="text"
              placeholder="如：朝阳高压线巡检"
              class="w-full px-3 py-2 rounded text-xs bg-slate-900 border border-slate-600 text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">描述（可选）</label>
            <input
              v-model="newTemplateDesc"
              type="text"
              placeholder="备注说明"
              class="w-full px-3 py-2 rounded text-xs bg-slate-900 border border-slate-600 text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">任务分类</label>
            <select
              v-model="newTemplateCategory"
              class="w-full px-3 py-2 rounded text-xs bg-slate-900 border border-slate-600 text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="power">⚡ 电力巡检</option>
              <option value="agriculture">🌾 农业植保</option>
              <option value="survey">🗺️ 测绘勘察</option>
              <option value="security">🛡️ 安防巡逻</option>
              <option value="other">📌 其他</option>
            </select>
          </div>
          <div class="bg-slate-900 rounded p-2 text-[10px] text-slate-500">
            <div>将保存：{{ store.waypoints.length }} 个航点</div>
            <div>算法：{{ store.selectedAlgorithm.toUpperCase() }}</div>
            <div>默认高度：{{ store.waypoints[0]?.altitude || 100 }}m</div>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button
            @click="showSaveDialog = false"
            class="flex-1 py-2 rounded text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
          >
            取消
          </button>
          <button
            @click="handleSave"
            :disabled="!newTemplateName.trim()"
            class="flex-1 py-2 rounded text-xs font-medium bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            保存模板
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
