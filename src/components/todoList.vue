<template>
  <div class="main">
    <h1>Todos</h1>
    <!-- 搜索 -->
    <div class="list-search">
      <a-button type="text"><down-outlined size="large" :style="{ color: allCompleted ? '#333' : '#eee'}" @click="onAllCompleted"/></a-button>
      <input
        v-model="name"
        placeholder="What needs to be done?"
        @keyup.enter="pageDown"
      />
    </div>
    <!-- 列表 -->
    <a-list item-layout="horizontal" :data-source="searchList">
      <template #renderItem="{ item }">
        <a-list-item v-if="isShowCompleted(item)" :draggable="item.isDraggable">
          <div>
            <div class="checkbox-box">
              <input
                type="checkbox"
                :class="['checkbox', item.completed ? 'checkbox-completed' : '']"
                v-model="item.completed"
                :id="item.id"
              />
              <label :for="item.id"></label>
            </div>
            <div v-if="!item.isDblclick" :class="['checkbox-content',item.completed ?  'text-completed' : '']" @dblclick="onDblclick(item)">{{ item.text }}</div>
            <div v-else class="checkbox-content">
              <input v-model="item.text" @blur="onEdit(item)" @keyup.enter="onEdit(item)" v-focus/>
            </div>
          </div>
          <div>
            <a-button type="text"  @click="onTouchstart(item)"><unordered-list-outlined size="large"/></a-button>
            <a-button type="text" @click="onDelete(item)"
              ><close-outlined size="large" 
            /></a-button>
          </div>
        </a-list-item>
      </template>
      <!-- 底部按钮 -->
      <template #footer v-if="searchList.length">
        <span>{{ listLength }} item left</span>
        <ul>
          <li v-for="(item,index) in checkList" :key="index" :class="{ 'checkout-box': item.index == completeIndex }" @click="onChangeComplete(item.index)">
            {{item.text}}
          </li>                 
        </ul>
        <a-button type="text" v-if="searchList.length > listLength" @click="showModal">Clear completed</a-button>
        <div v-else></div>
      </template>
    </a-list>
  </div>
  <!-- 文件操作 -->
  <a-button @click="exportJSON">导出文档</a-button><input type="file" id="file"  @change="importJSON">
  <!-- 删除提示 -->
  <a-modal v-model:visible="visible" title="提示" @ok="showModal" centered>
    <template #footer>
      <a-button key="submit" type="primary" @click="onRemoveAll">确定</a-button>
      <a-button  @click="showModal">取消</a-button>
    </template>
    <p class="tip"><question-circle-filled :style="{fontSize: '48px', color: '#f5c906'}"  />  <span>Clear completed ?</span> </p>
  </a-modal>
</template>

<script setup lang="ts">
import {
  DownOutlined,
  CloseOutlined,
  UnorderedListOutlined,
  QuestionCircleFilled
} from "@ant-design/icons-vue";
import { computed, ref, reactive, nextTick } from "vue";
import  FileSaver  from "file-saver"

interface DataItem {
  text: string;
  completed: boolean;
  isDblclick: boolean;
  isDraggable: boolean;
  id: number;
}
interface checkItem {
  text: string;
  index: number;
}


// 输入值
const name = ref<string>("");
// 删除弹窗展示
const visible = ref<boolean>(false);
// 状态类型
const completeIndex = ref<number>(1)
// 展示列表
const searchList = ref<Array>([]);
// 状态表
const checkList: checkItem[] = reactive(
  [
    { text: 'All', index: 1 },
    { text: "Active", index: 2 },
    { text: 'Completed', index: 3 }
  ]
)
// 添加模版
const searchItem: DataItem = reactive({
  text: "",
  completed: false,
  isDblclick: false,
  isDraggable: false,
  id: 0,
});

// 计算出 未完成状态数据长度
const listLength:number| string = computed(() => {
  const active = searchList.value.filter((item:DataItem): [] => {
    if(!item.completed)  return item
  }) || []
  return active.length
})

// 计算是否全选
const allCompleted:boolean = computed(() => {
  return searchList.value.every((item: DataItem):boolean => {
    return item.completed
  })
   
})

// 判断是否是展示未完成状态
const isShowCompleted = (item: DataItem): boolean => {
  return !((item.completed && completeIndex.value == 2) || (!item.completed && completeIndex.value == 3))
}

// 添加数据模版
const addTodo = (text: string, todos: Array) => {
  const item = JSON.parse(JSON.stringify(searchItem));
  item.text = text;
  todos.value.unshift(item);
  nextTick(() => {
    name.value = "";
  });
};
// 删除
const removeTodo = (arr: Array, value: string): [] | string => {
  if (!arr || arr.length == 0) {
    return "";
  }
  let newArr = arr.value.filter((item:DataItem):[] => {
    return item["id"] != value;
  });
  return newArr;
};
// 回车
const pageDown = () => {
  const text = name.value && name.value.trim();
  if (text.length === 0) return;
  searchItem.id++;
  addTodo(text, searchList);
};
// 全选
const onAllCompleted = () => {
  if(allCompleted.value){
  searchList.value = searchList.value.map((item:DataItem):[] => {
    item.completed = false
    return item
  })
  }else {
    searchList.value = searchList.value.map((item:DataItem):[] => {
    item.completed = true
    return item
  })
  }

}
// 改变状态
// const onChangeCheck = (item: DataItem) => {
//   console.log(item);
// };
// 删除操作
const onDelete = (item:DataItem) => {
  searchList.value = removeTodo(searchList, item.id);
};
// 展示弹窗
const showModal = () => {
  visible.value = ! visible.value;
};
// 更改状态
const onChangeComplete = (item:number ) => {
  completeIndex.value = item
}
// 删除所有完成状态
const onRemoveAll = () => {
  searchList.value = searchList.value.filter((item:DataItem):[] => {
    if(!item.completed)  return item
  });
  nextTick(() => {
    visible.value = ! visible.value;
  });
}
// 双击
const onDblclick = (item: DataItem) => {
    searchList.value = searchList.value.map((item:DataItem):[] => {
    item.isDblclick = false
    return item
  });
  item.isDblclick = true
}
// 编辑
const onEdit = (item: DataItem) => {
  item.isDblclick = false
  const text = item.text && item.text.trim();
  if(!text) {
    onDelete(item)
  }
}
// 开发拖动
const onTouchstart = (item: DataItem) => {
  item.isDraggable = true
}
// 导出
const exportJSON = () => {
  const data = JSON.stringify(searchList)
  const blob = new Blob([data], {type: ''})
  FileSaver.saveAs(blob, 'todo.json')
}
// 倒入
const  importJSON = () => {
  const file = document.getElementById('file').files[0]
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = () =>{
    searchList.value =   JSON.parse(reader.result)._value
  }
}

</script>
<style lang="scss" scoped>
.main {
  width: 50%;
  margin: 0 auto;
}
h1 {
  font-size: 100px;
  color: rgba(175, 47, 47, 0.15);
  font-weight: 100;
  margin: 0;
}
.list-search {
  border: 1px solid #eee;
  padding: 16px 16px 16px 12px;
  background: rgba(0, 0, 0, 0.003);
  box-shadow: inset 0 -2px 1px rgb(0 0 0 / 3%);
  > button {
    width: 48px;
    height: 100%;
  }
  input {
    width: calc(100% - 50px);
    font-size: 20px !important;
    line-height: 1.4em !important;
    border: 0;
    outline: none;
    padding: 0 18px;
  }
}

:deep(.ant-list-item) {
  border: 1px solid #f0f0f0;
  border-top: none;
  height: 52px;
  font-size: 20px;
  > div {
    display: flex;
    flex-direction: row;
  }
  > div:first-child {
    width: 75%;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
:deep(.ant-list-split .ant-list-item:last-child) {
  border-bottom: 1px solid #f0f0f0;
}
.checkbox-box {
  position: relative;
  width: 36px;
  height: 36px;
}
.checkbox {
  position: absolute;
  visibility: hidden;
}
.checkbox + label {
  position: absolute;
  width: 36px;
  height: 36px;
  border: 1px solid #ccc;
  border-radius: 50%;
  background-color: #fff;
}
.checkbox-completed + label {
  position: absolute;
  width: 36px;
  height: 36px;
  border: 1px solid #eee;
  border-radius: 50%;
  background-color: #fff;
}
.text-completed {
  color: #eee;
  text-decoration: line-through;
}
.checkbox:checked + label:after {
  content: "";
  position: absolute;
  left: 8px;
  top: 8px;
  width: 20px;
  height: 12px;
  border: 2px solid #06f53a;
  border-top-color: transparent;
  border-right-color: transparent;
  transform: rotate(-45deg);
  -ms-transform: rotate(-60deg);
  -moz-transform: rotate(-60deg);
  -webkit-transform: rotate(-60deg);
}
.checkbox-content {
  width: calc(100% - 36px);
  text-align: left;
  padding-left: 32px;
}
button {
  span {
    font-size: 22px;
  }
}
:deep(.ant-list-footer) {
  border: 1px solid #f0f0f0;
  border-top: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 42px;
  > span {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  > div {
    width: 137px;
  }
  ul{
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0;
    li{
      height: 100%;
      width: 92px;
      margin: 0 12px;
      cursor: pointer
    }
  }
}
ul,
li {
  list-style: none;
}
.tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  > span:last-child{
    margin: 0 24px;
  }
}
.checkout-box {
  border: 1px solid rgba(192, 98, 81, .5);
}
</style>
