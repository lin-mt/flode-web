import { Empty } from "antd";
import _ from "lodash";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import SchemaItem from "./SchemaItem";
import { JSONSchema7, SchemaEditorProps } from "./types";
import { getDefaultSchema } from "./utils";

export interface JsonSchemaEditorHandle {
  changeSchema: (namePath: number[], value: any, propertyName?: string) => void;
}

const defaultSchema: JSONSchema7 = {
  type: "object",
  properties: {
    field: { type: "string" },
  },
};

function initSchema(data: string | undefined): JSONSchema7 {
  if (!data) {
    return defaultSchema;
  }
  return JSON.parse(data);
}

const JsonSchemaEditor = forwardRef<JsonSchemaEditorHandle, SchemaEditorProps>(
  (props, ref) => {
    const {
      style,
      rootName = "root",
      rootNameEditable = false,
      rootNameChange,
      rootTypeChange,
      rootTypeDisable = false,
    } = props;
    const [rootNameState, setRootNameState] = useState<string>(rootName);
    const [schema, setSchema] = useState<JSONSchema7>();
    const [fieldCount, setFieldCount] = useState(0);

    // const [schema, setSchema] = useState<JSONSchema7>({
    //   type: 'object', properties: {
    //     'objectP': {type: 'object', properties: {'o1numberP': {type: 'number'}}},
    //     'numberP': {type: 'number'},
    //     'booleanP': {type: 'boolean'},
    //     'arrayString': {type: 'array', items: {type: 'string'}},
    //     'arrayObject': {type: 'array', items: {type: 'object', properties: {'arrayObjStr': {type: 'string'}}}},
    //     'integerP': {type: 'integer'},
    //     'stringP': {type: 'string'},
    //   }
    // })

    useEffect(() => {
      setSchema(initSchema(props.value));
    }, [props.value]);

    useEffect(() => {
      if (rootName) {
        setRootNameState(rootName);
      }
    }, [rootName]);

    const changeRootSchema = (schema: JSONSchema7 | undefined) => {
      setSchema(schema);
      if (props.onChange) {
        props.onChange(JSON.stringify(schema));
      }
    };

    const changeSchema = (
      namePath: number[],
      value: any,
      propertyName?: string
    ) => {
      // console.log("changeSchema", namePath, value, propertyName);
      if (namePath.length === 0) {
        if (rootTypeChange && (!propertyName || propertyName === "type")) {
          if (!rootTypeChange(value.type)) {
            return;
          }
        }
        changeRootSchema(value);
        return;
      }
      let schemaClone = _.cloneDeep(schema);
      let current: any = schemaClone;
      for (let i = 0; i < namePath.length - 1; i++) {
        const key = Object.keys(current)[namePath[i]];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      const lastKey = namePath[namePath.length - 1];
      const lastKeyActual = Object.keys(current)[lastKey];
      if (lastKey === -1) {
        if (typeof value === "undefined" || !propertyName) {
          return;
        }
        current[propertyName] = value;
      } else {
        if (current[lastKeyActual] === value) {
          return;
        }
        current[lastKeyActual] = value;
      }
      changeRootSchema(schemaClone);
    };

    function renameProperty(path: number[], newKey: string | number): void {
      let schemaClone = _.cloneDeep(schema);
      let current: any = schemaClone;
      let parent: any = null;
      let lastKey: string | number = "";
      for (let i = 0; i < path.length - 1; i++) {
        const keys = Object.keys(current);
        let index: number;
        if (typeof path[i] === "number") {
          index = path[i] as number;
        } else {
          index = keys.indexOf(String(path[i]));
        }
        if (index < 0 || index >= keys.length) {
          console.error(`Path not found: ${path.slice(0, i + 1).join(".")}`);
          return;
        }
        parent = current;
        lastKey = keys[index];
        current = current[lastKey];
      }
      const oldKeyIndex = path[path.length - 1];
      const keys = Object.keys(current);
      const oldKey = keys[oldKeyIndex];
      if (oldKey === newKey) {
        return;
      }
      if (current.hasOwnProperty(oldKey)) {
        parent[lastKey] = Object.fromEntries(
          Object.entries(current).map(([key, value]) => {
            if (key === oldKey) {
              const parentRequired = parent["required"];
              if (parentRequired) {
                const requiredIndex = parentRequired.indexOf(oldKey);
                if (requiredIndex >= 0) {
                  parentRequired.splice(requiredIndex, 1, newKey);
                }
              }
              return [newKey, value];
            }
            return [key, value];
          })
        );
      } else {
        console.error(`Key not found: ${oldKey}`);
        return;
      }
      changeRootSchema(schemaClone);
    }

    function updateRequired(target: any, property: string, remove: boolean) {
      if (!target.required) {
        target.required = [];
      }
      const index = target.required.indexOf(property);
      if (remove) {
        if (index !== -1) {
          target.required.splice(index, 1);
        }
      } else {
        if (index === -1) {
          target.required.push(property);
        }
      }
      if (target.required.length === 0) {
        delete target.required;
      }
    }

    function updateRequiredProperty(
      path: number[],
      requiredProperty: string,
      removed: boolean
    ) {
      // console.log("updateRequiredProperty", path, requiredProperty, removed);
      let schemaClone = _.cloneDeep(schema);
      let current: any = schemaClone;
      for (let i = 0; i < path.length; i++) {
        const index = path[i];
        const keys = Object.keys(current);
        if (typeof current[keys[index]] === "undefined") {
          current[keys[index]] = {};
        }
        current = current[keys[index]];
      }
      updateRequired(current, requiredProperty, removed);
      changeRootSchema(schemaClone);
    }

    function removeProperty(path: number[]) {
      let schemaClone = _.cloneDeep(schema);
      let current: any = schemaClone;
      let pre: any = schemaClone;
      for (let i = 0; i < path.length - 1; i++) {
        if (current !== undefined && current !== null) {
          pre = current;
          current = current[Object.keys(current)[path[i]]];
        } else {
          console.error("移除的路径无效", path);
          return; // 如果路径无效，则直接返回
        }
      }
      let finalKey = Object.keys(current)[path[path.length - 1]];
      updateRequired(pre, finalKey, true);
      if (
        current &&
        typeof current === "object" &&
        current.hasOwnProperty(finalKey)
      ) {
        delete current[finalKey];
      }
      changeRootSchema(schemaClone);
    }

    function addProperty(namePath: number[], isChild: boolean) {
      // console.log(namePath, isChild, 'addProperty');
      let schemaClone = _.cloneDeep(schema);
      let current: any = schemaClone;
      for (let i = 0; i < namePath.length - (isChild ? 0 : 1); i++) {
        const key = Object.keys(current)[namePath[i]];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      const newSchema = getDefaultSchema("string");
      if (isChild) {
        current["properties"][`field_${fieldCount}`] = newSchema;
      } else {
        current[`field_${fieldCount}`] = newSchema;
      }
      setFieldCount(fieldCount + 1);
      changeRootSchema(schemaClone);
    }

    const handleRootNameChange = (name: string) => {
      if (rootNameChange) {
        if (rootNameChange(name)) {
          setRootNameState(name);
        }
      } else {
        setRootNameState(name);
      }
    };

    useImperativeHandle(ref, () => ({ changeSchema }));

    return (
      <div style={{ ...style }}>
        {schema ? (
          <SchemaItem
            rootName={rootNameState}
            rootNameEditable={rootNameEditable}
            handleRootNameChange={handleRootNameChange}
            rootTypeDisable={rootTypeDisable}
            schema={schema}
            changeSchema={changeSchema}
            renameProperty={renameProperty}
            removeProperty={removeProperty}
            addProperty={addProperty}
            updateRequiredProperty={updateRequiredProperty}
            handleAdvancedSettingClick={props.handleAdvancedSettingClick}
          />
        ) : (
          <Empty />
        )}
      </div>
    );
  }
);

export default JsonSchemaEditor;
