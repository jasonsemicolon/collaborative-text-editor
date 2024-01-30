/* eslint-disable react-hooks/exhaustive-deps */
import ObjectID from "bson-objectid";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import richText from "rich-text";
import { Doc, Error } from "sharedb";
import sharedb from "sharedb/lib/client";
import {
  CollectionName,
  DocumentID,
  LocalPresence,
  Socket,
} from "sharedb/lib/sharedb";
import tinycolor from "tinycolor2";
import { CursorType, MousePosition } from "../../@types/mouse/Mouse";

// =========== types =========
type useTextEditorProps = {
  collectionName: CollectionName;
  docID: DocumentID;
  wsAddress: string;
  username: string;
};

type Range = {
  name: string;
  color: string;
};

// ============= Configs ===========
sharedb.types.register(richText.type as any);
Quill.register("modules/cursors", QuillCursors);

/**
 * useTextEditor Hook
 */
export default function useTextEditor({
  collectionName = "collection",
  docID = "docId",
  wsAddress,
  username,
}: useTextEditorProps) {
  // ---------------------------------------------
  // |                   States                  |
  // ---------------------------------------------
  const [color] = useState<string>(tinycolor.random().toHexString());
  const [presenceId] = useState<string>(new ObjectID().toString());
  const [doc, setDoc] = useState<Doc | null>(null);
  const [quill, setQuill] = useState<Quill | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(
    null
  );
  const [mousePresence, setMousePresence] = useState<LocalPresence | null>(
    null
  );
  const [cursors, setCursors] = useState<CursorType[]>([]);

  let containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------
  // |                  Effects                  |
  // ---------------------------------------------
  useEffect(() => {
    // For tracking the mouse position when the mouse moves
    let bodyElm = document.body;
    bodyElm.addEventListener("mousemove", function (event: MouseEvent) {
      let containerWidth = bodyElm.offsetWidth;
      let containerHeight = bodyElm.offsetHeight;
      let leftPercentage = (100 * event.clientX) / containerWidth + "%";
      let topPercentage = (100 * event.clientY) / containerHeight + "%";
      setMousePosition?.({
        top: topPercentage,
        left: leftPercentage,
      });
    });
    // For run connecting to shareDB when the container is mounted
    if (containerRef.current) {
      connect();
    }
  }, []);

  useEffect(() => {
    // For run Quill and run ws listeners
    if (doc) {
      initializeQuill();
    }
  }, [doc]);

  useEffect(() => {
    // For send mouse position when mouse presence is ready and mouse moved
    if (mousePresence) {
      let data = {
        id: username,
        color,
        position: mousePosition,
        username,
      };
      mousePresence.submit(data, function (error: Error) {
        if (error) {
          return console.error("mouse presence error!");
        }
      });
    }
  }, [mousePosition?.top, mousePosition?.left]);

  // ---------------------------------------------
  // |                 Functions                 |
  // ---------------------------------------------
  function connect() {
    let socket = new ReconnectingWebSocket("ws://" + wsAddress, [], {
      // ShareDB handles dropped messages, and buffering them while the socket
      // is closed has undefined behavior
      maxEnqueuedMessages: 0,
    }) as Socket;
    let connection = new sharedb.Connection(socket);
    let doc = connection.get(collectionName, docID);

    doc.subscribe(function (err: Error) {
      if (err) {
        return console.error("doc subscribe error!");
      }
      setDoc(doc);
    });
  }

  function initializeQuill() {
    if (!containerRef?.current || quill) return;

    let quillInstance = new Quill(containerRef.current, {
      theme: "snow",
      modules: { cursors: true, toolbar: "#toolbar-container" },
    });
    let cursorsModule = quillInstance.getModule("cursors");

    quillInstance.setContents(doc?.data);

    quillInstance.on(
      "text-change",
      function (delta: any, oldDelta: any, source: string) {
        if (source !== "user") return;
        doc?.submitOp(delta);
      }
    );

    doc?.on("op", function (op: any, source: any) {
      if (source) return;
      quillInstance.updateContents(op);
    });

    // ------------- Doc Presence -------------
    let presence = doc?.connection.getDocPresence(collectionName, docID);
    presence?.subscribe(function (error: Error) {
      if (error) {
        return console.error("presence subscribe error!");
      }
    });

    let localPresence = presence?.create(presenceId);

    quillInstance.on(
      "selection-change",
      function (range: any, oldRange: any, source: string) {
        // We only need to send updates if the user moves the cursor
        // themselves. Cursor updates as a result of text changes will
        // automatically be handled by the remote client.
        if (source !== "user") return;
        // Ignore blurring, so that we can see lots of users in the
        // same window. In real use, you may want to clear the cursor.
        if (!range) return;
        // In this particular instance, we can send extra information
        // on the presence object. This ability will lety depending on
        // type.
        range.name = username;
        range.color = color;

        localPresence?.submit(range, function (error: Error) {
          if (error) {
            return console.error("local presence error!");
          }
        });
      }
    );

    presence?.on("receive", function (id: string, range: Range) {
      let name = (range && range.name) || "Anonymous";
      let color = (range && range.color) || tinycolor.random().toHexString();
      cursorsModule.createCursor(id, name, color);
      cursorsModule.moveCursor(id, range);
    });

    // ------------- Mouse Presence -------------
    let mousePresence = doc?.connection.getPresence(docID);
    mousePresence?.subscribe(function (error: Error) {
      if (error) {
        return console.error("mouse presence subscribe error!");
      }
    });

    let mouseLocalPresence = mousePresence?.create(
      username /* used username as presence ID */
    );
    mousePresence?.on(
      "receive",
      function (id: string, data: CursorType | null) {
        handleCursors(id, data);
      }
    );
    setMousePresence(mouseLocalPresence!);
    setQuill(quillInstance);
  }

  function handleCursors(id: string, data: CursorType | null) {
    if (data) {
      let cursorData = {
        id,
        color: data?.color,
        username: data?.username,
        position: data?.position,
      };
      setCursors((prevCursors) => {
        let list = [...prevCursors];
        let filter = list.filter((item: CursorType) => item.id !== id);
        filter.push(cursorData);
        return filter;
      });
    } else {
      setCursors((prevCursors) => {
        let list = [...prevCursors];
        let filter = list.filter((item: CursorType) => item.id !== id);
        return filter;
      });
    }
  }

  return {
    containerRef,
    cursors,
  };
}
